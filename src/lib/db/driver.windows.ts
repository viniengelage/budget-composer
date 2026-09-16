import {
  DatabaseError,
  type Database,
  type DatabaseDriver,
  type SqlValue,
} from "@/lib/db/types";
import {
  NativeRnwSqlite,
  type RnwSqliteModule,
} from "@modules/rnw-sqlite/src/NativeRnwSqlite";

/**
 * Driver de SQLite para Windows, sobre o módulo nativo C++/WinRT `RnwSqlite`
 * (ver `modules/rnw-sqlite/windows`).
 */
function requireNative(): RnwSqliteModule {
  if (NativeRnwSqlite === null) {
    throw new Error(
      "O módulo nativo RnwSqlite não está registrado.\n" +
        "Verifique se 'rnw-sqlite' está nas dependências do package.json e rode:\n" +
        "  bun run prebuild && bunx react-native autolink-windows",
    );
  }
  return NativeRnwSqlite;
}

function wrap(handle: number): Database {
  const native = requireNative();

  const api: Database = {
    async execute(sql, params = []) {
      try {
        return await native.execute(handle, sql, params as SqlValue[]);
      } catch (error) {
        throw new DatabaseError("Falha ao executar instrução", sql, error);
      }
    },

    async query(sql, params = []) {
      try {
        return (await native.query(handle, sql, params as SqlValue[])) as never;
      } catch (error) {
        throw new DatabaseError("Falha ao consultar", sql, error);
      }
    },

    /**
     * Transação em SQL puro.
     *
     * O nativo não expõe API de transação de propósito: BEGIN/COMMIT/ROLLBACK
     * são instruções comuns, então resolver aqui deixa o C++ com quatro
     * métodos em vez de sete. Menos C++ é menos superfície para depurar numa
     * plataforma que não temos como testar localmente.
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
