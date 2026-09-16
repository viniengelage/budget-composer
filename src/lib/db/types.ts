export type SqlValue = string | number | null;

export interface ExecuteResult {
  rowsAffected: number;
  insertId: number | null;
}

export interface Database {
  execute(sql: string, params?: readonly SqlValue[]): Promise<ExecuteResult>;

  query<T extends Record<string, unknown>>(
    sql: string,
    params?: readonly SqlValue[],
  ): Promise<T[]>;

  transaction<T>(fn: (tx: Database) => Promise<T>): Promise<T>;

  close(): Promise<void>;
}

export interface DatabaseDriver {
  open(name: string): Promise<Database>;
}

export class DatabaseError extends Error {
  readonly sql: string;

  constructor(message: string, sql: string, cause?: unknown) {
    super(`${message}\nSQL: ${sql}`, { cause });
    this.name = "DatabaseError";
    this.sql = sql;
  }
}
