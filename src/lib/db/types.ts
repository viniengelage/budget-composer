/**
 * Contrato do banco de dados — a fronteira entre o app e o SQLite de cada plataforma.
 *
 * Esta interface é DELIBERADAMENTE minúscula: quatro operações. Cada método
 * aqui vira código nativo que alguém precisa escrever e manter em C++ no
 * Windows. Toda adição custa caro na plataforma mais difícil de testar.
 *
 * Implementações:
 *   driver.macos.ts   expo-sqlite          (verificado: pod integrado)
 *   driver.windows.ts TurboModule C++/WinRT (a escrever)
 *   driver.bun.ts     bun:sqlite            (só testes — SQLite real em bun test)
 */

/** Tipos que o SQLite aceita como parâmetro vinculado. */
export type SqlValue = string | number | null;

export interface ExecuteResult {
  rowsAffected: number;
  /** `rowid` do último INSERT, ou null quando a instrução não inseriu nada. */
  insertId: number | null;
}

export interface Database {
  /** INSERT, UPDATE, DELETE, DDL. */
  execute(sql: string, params?: readonly SqlValue[]): Promise<ExecuteResult>;

  /** SELECT. O chamador é responsável por validar o formato das linhas. */
  query<T extends Record<string, unknown>>(
    sql: string,
    params?: readonly SqlValue[],
  ): Promise<T[]>;

  /**
   * Executa em transação. Faz rollback se `fn` lançar.
   *
   * Existe porque salvar um orçamento grava em duas tabelas (`quotes` e
   * `quote_items`): gravar uma e falhar na outra deixaria um orçamento
   * sem itens no banco.
   */
  transaction<T>(fn: (tx: Database) => Promise<T>): Promise<T>;

  close(): Promise<void>;
}

export interface DatabaseDriver {
  /** `name` é o nome do arquivo; cada plataforma resolve a pasta de dados do usuário. */
  open(name: string): Promise<Database>;
}

/** Erro de banco com a instrução que falhou — sem isso, depurar SQL no Windows é às cegas. */
export class DatabaseError extends Error {
  readonly sql: string;

  constructor(message: string, sql: string, cause?: unknown) {
    super(`${message}\nSQL: ${sql}`, { cause });
    this.name = "DatabaseError";
    this.sql = sql;
  }
}
