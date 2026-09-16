#pragma once

#include "pch.h"

#include <NativeModules.h>

#include <winsqlite/winsqlite3.h>

#include <cstdlib>
#include <cstring>    // _strnicmp
#include <filesystem>
#include <map>
#include <mutex>
#include <stdexcept>  // std::runtime_error
#include <string>

namespace winrt::RnwSqlite {

namespace React = winrt::Microsoft::ReactNative;

// ---------------------------------------------------------------------------
// Módulo nativo de SQLite para React Native Windows.
//
// SQLITE VEM DO SISTEMA (winsqlite3), não vendorizado.
// O Windows 10 1803+ embarca winsqlite3.dll e o SDK traz winsqlite/winsqlite3.h
// e winsqlite3.lib. Isso evita colocar a amalgamation de ~9 MB no repositório
// e um passo de download no build. Se a versão do SQLite do sistema virar
// problema, trocar para a amalgamation é contido: muda este include, o .lib
// em AdditionalDependencies e nada mais.
//
// MODELO DE CONCORRÊNCIA
// Métodos REACT_METHOD com ReactPromise rodam na fila assíncrona do módulo,
// fora da thread de JS. O mapa de handles é protegido por mutex porque nada
// garante que duas chamadas não caiam em threads diferentes.
// ---------------------------------------------------------------------------

REACT_MODULE(RnwSqliteModule, L"RnwSqlite");
struct RnwSqliteModule {
  // -------------------------------------------------------------------------
  // open
  // -------------------------------------------------------------------------
  REACT_METHOD(Open, L"open");
  void Open(std::string name, React::ReactPromise<double> promise) noexcept {
    try {
      const auto path = ResolveDatabasePath(name);

      sqlite3* handle = nullptr;
      const int status = sqlite3_open_v2(
          path.c_str(), &handle,
          SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE | SQLITE_OPEN_FULLMUTEX,
          nullptr);

      if (status != SQLITE_OK) {
        const std::string message =
            handle ? sqlite3_errmsg(handle) : "sqlite3_open_v2 falhou";
        if (handle) sqlite3_close_v2(handle);
        promise.Reject(("Não foi possível abrir o banco: " + message).c_str());
        return;
      }

      // Espera em vez de devolver SQLITE_BUSY na hora. O app é de um usuário
      // só, mas uma transação longa não pode derrubar outra chamada.
      sqlite3_busy_timeout(handle, 5000);

      std::lock_guard<std::mutex> lock(m_mutex);
      const int64_t id = ++m_nextHandle;
      m_databases[id] = handle;
      promise.Resolve(static_cast<double>(id));
    } catch (const std::exception& error) {
      promise.Reject(error.what());
    }
  }

  // -------------------------------------------------------------------------
  // close
  // -------------------------------------------------------------------------
  REACT_METHOD(Close, L"close");
  void Close(double handleId, React::ReactPromise<void> promise) noexcept {
    std::lock_guard<std::mutex> lock(m_mutex);

    const auto entry = m_databases.find(static_cast<int64_t>(handleId));
    if (entry == m_databases.end()) {
      promise.Reject("Handle de banco inválido.");
      return;
    }

    sqlite3_close_v2(entry->second);
    m_databases.erase(entry);
    promise.Resolve();
  }

  // -------------------------------------------------------------------------
  // execute — INSERT / UPDATE / DELETE / DDL
  // -------------------------------------------------------------------------
  REACT_METHOD(Execute, L"execute");
  void Execute(double handleId, std::string sql, React::JSValueArray params,
               React::ReactPromise<React::JSValue> promise) noexcept {
    sqlite3* db = Lookup(handleId);
    if (db == nullptr) {
      promise.Reject("Handle de banco inválido.");
      return;
    }

    sqlite3_stmt* statement = nullptr;
    if (!Prepare(db, sql, params, &statement, promise)) return;

    const int status = sqlite3_step(statement);
    if (status != SQLITE_DONE && status != SQLITE_ROW) {
      const std::string message = sqlite3_errmsg(db);
      sqlite3_finalize(statement);
      promise.Reject(message.c_str());
      return;
    }
    sqlite3_finalize(statement);

    React::JSValueObject result;
    // Cast explícito: JSValue tem construtores para bool, int64_t e double,
    // e um `int` cru deixaria a escolha da sobrecarga ambígua.
    result["rowsAffected"] = static_cast<double>(sqlite3_changes(db));

    // insertId só faz sentido em INSERT. Devolver o rowid de um DELETE
    // levaria o chamador a gravar um id que não é dele.
    if (IsInsert(sql)) {
      result["insertId"] =
          static_cast<double>(sqlite3_last_insert_rowid(db));
    } else {
      result["insertId"] = nullptr;
    }

    promise.Resolve(React::JSValue(std::move(result)));
  }

  // -------------------------------------------------------------------------
  // query — SELECT
  // -------------------------------------------------------------------------
  REACT_METHOD(Query, L"query");
  void Query(double handleId, std::string sql, React::JSValueArray params,
             React::ReactPromise<React::JSValue> promise) noexcept {
    sqlite3* db = Lookup(handleId);
    if (db == nullptr) {
      promise.Reject("Handle de banco inválido.");
      return;
    }

    sqlite3_stmt* statement = nullptr;
    if (!Prepare(db, sql, params, &statement, promise)) return;

    React::JSValueArray rows;
    int status = sqlite3_step(statement);

    while (status == SQLITE_ROW) {
      React::JSValueObject row;
      const int columns = sqlite3_column_count(statement);

      for (int index = 0; index < columns; ++index) {
        const char* rawName = sqlite3_column_name(statement, index);
        const std::string column = rawName ? rawName : "";

        switch (sqlite3_column_type(statement, index)) {
          case SQLITE_INTEGER:
            // JS não tem inteiro de 64 bits. Valores do domínio (centavos,
            // números de orçamento) cabem com folga em double.
            row[column] = static_cast<double>(
                sqlite3_column_int64(statement, index));
            break;
          case SQLITE_FLOAT:
            row[column] = sqlite3_column_double(statement, index);
            break;
          case SQLITE_NULL:
            row[column] = nullptr;
            break;
          default: {
            const auto* text = reinterpret_cast<const char*>(
                sqlite3_column_text(statement, index));
            row[column] = text ? std::string(text) : std::string();
            break;
          }
        }
      }

      rows.push_back(React::JSValue(std::move(row)));
      status = sqlite3_step(statement);
    }

    if (status != SQLITE_DONE) {
      const std::string message = sqlite3_errmsg(db);
      sqlite3_finalize(statement);
      promise.Reject(message.c_str());
      return;
    }

    sqlite3_finalize(statement);
    promise.Resolve(React::JSValue(std::move(rows)));
  }

 private:
  std::mutex m_mutex;
  std::map<int64_t, sqlite3*> m_databases;
  int64_t m_nextHandle{0};

  sqlite3* Lookup(double handleId) {
    std::lock_guard<std::mutex> lock(m_mutex);
    const auto entry = m_databases.find(static_cast<int64_t>(handleId));
    return entry == m_databases.end() ? nullptr : entry->second;
  }

  static bool IsInsert(const std::string& sql) {
    size_t at = sql.find_first_not_of(" \t\r\n");
    if (at == std::string::npos || sql.size() - at < 6) return false;
    return _strnicmp(sql.c_str() + at, "insert", 6) == 0;
  }

  /**
   * Compila a instrução e vincula os parâmetros.
   *
   * Vincular é obrigatório — nunca concatenar valor em SQL. Fora a injeção,
   * concatenação quebra em nome com apóstrofo, e "Espaço D'Ávila" é um nome
   * de cliente perfeitamente comum.
   */
  template <typename TPromise>
  bool Prepare(sqlite3* db, const std::string& sql,
               const React::JSValueArray& params, sqlite3_stmt** statement,
               TPromise& promise) {
    if (sqlite3_prepare_v2(db, sql.c_str(), -1, statement, nullptr) !=
        SQLITE_OK) {
      promise.Reject(sqlite3_errmsg(db));
      return false;
    }

    int position = 1;
    for (const auto& param : params) {
      int status = SQLITE_OK;

      switch (param.Type()) {
        case React::JSValueType::Null:
          status = sqlite3_bind_null(*statement, position);
          break;
        case React::JSValueType::Boolean:
          status = sqlite3_bind_int(*statement, position,
                                    param.AsBoolean() ? 1 : 0);
          break;
        case React::JSValueType::Int64:
          status = sqlite3_bind_int64(*statement, position, param.AsInt64());
          break;
        case React::JSValueType::Double:
          status = sqlite3_bind_double(*statement, position, param.AsDouble());
          break;
        default: {
          const std::string text = param.AsString();
          // SQLITE_TRANSIENT: o SQLite copia. `text` morre no fim do escopo.
          status = sqlite3_bind_text(*statement, position, text.c_str(),
                                     static_cast<int>(text.size()),
                                     SQLITE_TRANSIENT);
          break;
        }
      }

      if (status != SQLITE_OK) {
        const std::string message = sqlite3_errmsg(db);
        sqlite3_finalize(*statement);
        *statement = nullptr;
        promise.Reject(message.c_str());
        return false;
      }

      ++position;
    }

    return true;
  }

  /**
   * Resolve o caminho do arquivo em %LOCALAPPDATA%\OrcamentosGrameira\.
   *
   * Usa a variável de ambiente, e não ApplicationData::Current(), porque esta
   * lança exceção quando o app roda sem empacotamento MSIX — que é justamente
   * o modo em que rodamos durante o desenvolvimento.
   */
  static std::string ResolveDatabasePath(const std::string& name) {
    // Banco em memória é para teste: não tem arquivo, não tem pasta.
    if (name == ":memory:") return name;

    const char* localAppData = std::getenv("LOCALAPPDATA");
    if (localAppData == nullptr) {
      throw std::runtime_error("LOCALAPPDATA não está definida.");
    }

    std::filesystem::path folder =
        std::filesystem::path(localAppData) / "OrcamentosGrameira";
    std::filesystem::create_directories(folder);

    return (folder / name).string();
  }
};

}  // namespace winrt::RnwSqlite
