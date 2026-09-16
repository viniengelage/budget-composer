import * as SQLite from "expo-sqlite";

import {
  DatabaseError,
  type Database,
  type DatabaseDriver,
  type SqlValue,
} from "@/lib/db/types";

function wrap(db: SQLite.SQLiteDatabase): Database {
  const api: Database = {
    async execute(sql, params = []) {
      try {
        const result = await db.runAsync(sql, params as SqlValue[]);
        return {
          rowsAffected: result.changes,
          insertId: /^\s*insert/i.test(sql) ? result.lastInsertRowId : null,
        };
      } catch (error) {
        throw new DatabaseError("Falha ao executar instrução", sql, error);
      }
    },

    async query(sql, params = []) {
      try {
        return await db.getAllAsync(sql, params as SqlValue[]);
      } catch (error) {
        throw new DatabaseError("Falha ao consultar", sql, error);
      }
    },

    async transaction(fn) {
      let result!: Awaited<ReturnType<typeof fn>>;
      await db.withTransactionAsync(async () => {
        result = await fn(api);
      });
      return result;
    },

    async close() {
      await db.closeAsync();
    },
  };

  return api;
}

export const driver: DatabaseDriver = {
  async open(name) {
    const db = await SQLite.openDatabaseAsync(name);
    await db.execAsync("PRAGMA foreign_keys = ON");
    return wrap(db);
  },
};
