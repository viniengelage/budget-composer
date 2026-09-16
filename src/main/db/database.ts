import { Database as SqliteDatabase } from "bun:sqlite";

export type SqlParam = string | number | null;

export interface Db {
  all<T>(sql: string, params?: SqlParam[]): T[];
  get<T>(sql: string, params?: SqlParam[]): T | null;
  run(sql: string, params?: SqlParam[]): { changes: number };
  exec(sql: string): void;
  transaction<T>(fn: () => T): T;
  close(): void;
}

export function openDatabase(path: string): Db {
  const db = new SqliteDatabase(path, { create: true, strict: false });

  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");

  return {
    all<T>(sql: string, params: SqlParam[] = []): T[] {
      return db.query(sql).all(...params) as T[];
    },
    get<T>(sql: string, params: SqlParam[] = []): T | null {
      return (db.query(sql).get(...params) as T | null) ?? null;
    },
    run(sql: string, params: SqlParam[] = []) {
      const result = db.query(sql).run(...params);
      return { changes: Number(result.changes) };
    },
    exec(sql: string): void {
      db.exec(sql);
    },
    transaction<T>(fn: () => T): T {
      return db.transaction(fn)();
    },
    close(): void {
      db.close();
    },
  };
}
