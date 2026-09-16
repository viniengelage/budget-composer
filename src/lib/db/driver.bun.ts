import { Database as BunDatabase } from "bun:sqlite";

import {
  DatabaseError,
  type Database,
  type DatabaseDriver,
  type ExecuteResult,
  type SqlValue,
} from "@/lib/db/types";

/**
 * Driver de SQLite para `bun test`.
 *
 * NÃO é empacotado no app — `bun:sqlite` só existe no runtime do Bun. Serve
 * para rodar migrações e repositórios contra um SQLite DE VERDADE nos testes,
 * em vez de um dublê em memória que aceita SQL inválido e esconde bug.
 */
function wrap(db: BunDatabase): Database {
  const api: Database = {
    async execute(sql, params = []) {
      try {
        const statement = db.query(sql);
        statement.run(...(params as SqlValue[]));

        const changes = db
          .query<{ c: number }, []>("SELECT changes() AS c")
          .get();
        const lastId = db
          .query<{ id: number }, []>("SELECT last_insert_rowid() AS id")
          .get();

        const result: ExecuteResult = {
          rowsAffected: changes?.c ?? 0,
          insertId: /^\s*insert/i.test(sql) ? (lastId?.id ?? null) : null,
        };
        return result;
      } catch (error) {
        throw new DatabaseError("Falha ao executar instrução", sql, error);
      }
    },

    async query(sql, params = []) {
      try {
        return db.query(sql).all(...(params as SqlValue[])) as never;
      } catch (error) {
        throw new DatabaseError("Falha ao consultar", sql, error);
      }
    },

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
      db.close();
    },
  };

  return api;
}

export const bunDriver: DatabaseDriver = {
  async open(name) {
    const db = new BunDatabase(name);
    db.exec("PRAGMA foreign_keys = ON");
    return wrap(db);
  },
};
