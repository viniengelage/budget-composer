import {
  DatabaseError,
  type Database,
  type DatabaseDriver,
  type ExecuteResult,
} from "@/lib/db/types";
import NativeRnwSqlite from "@modules/rnw-sqlite/src/NativeRnwSqlite";

/**
 * Driver de SQLite para Windows, sobre o TurboModule C++/WinRT `RnwSqlite`.
 *
 * ⚠️ A implementação nativa ainda NÃO existe. Este arquivo define o lado JS e
 * falha com mensagem explícita enquanto o C++ não for compilado — nunca com
 * um `undefined is not a function` no meio da tela da usuária.
 */
function requireNative() {
  if (NativeRnwSqlite === null) {
    throw new Error(
      "O módulo nativo RnwSqlite não está registrado. " +
        "Rode `bun run prebuild` e depois `bunx react-native autolink-windows`, " +
        "e confirme que modules/rnw-sqlite está nas dependências do package.json.",
    );
  }
  return NativeRnwSqlite;
}

function wrap(handle: number): Database {
  const native = requireNative();

  const api: Database = {
    async execute(sql, params = []) {
      try {
        const raw = await native.execute(handle, sql, JSON.stringify(params));
        return JSON.parse(raw) as ExecuteResult;
      } catch (error) {
        throw new DatabaseError("Falha ao executar instrução", sql, error);
      }
    },

    async query(sql, params = []) {
      try {
        const raw = await native.query(handle, sql, JSON.stringify(params));
        return JSON.parse(raw) as never;
      } catch (error) {
        throw new DatabaseError("Falha ao consultar", sql, error);
      }
    },

    /**
     * Transação em SQL puro.
     *
     * O nativo não expõe API de transação de propósito: BEGIN/COMMIT/ROLLBACK
     * são instruções SQL comuns, então isso é resolvido aqui e o C++ fica com
     * quatro métodos em vez de sete.
     */
    async transaction(fn) {
      await api.execute("BEGIN");
      try {
        const result = await fn(api);
        await api.execute("COMMIT");
        return result;
      } catch (error) {
        await api.execute("ROLLBACK");
        throw error;
      }
    },

    async close() {
      await native.close(handle);
    },
  };

  return api;
}

export const driver: DatabaseDriver = {
  async open(name) {
    const native = requireNative();
    const handle = await native.open(name);
    const db = wrap(handle);
    await db.execute("PRAGMA foreign_keys = ON");
    return db;
  },
};
