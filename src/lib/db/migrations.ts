import { type Database } from "@/lib/db/types";

/**
 * Migrações versionadas via `PRAGMA user_version`.
 *
 * Sem ferramenta externa de propósito: o schema tem 4 tabelas e o banco vive
 * na máquina de uma pessoa só. Um runner de 20 linhas cobre o caso e não
 * adiciona passo de codegen ao build — que, no Windows, já é a parte difícil.
 *
 * REGRA: migração já publicada nunca é editada. Só se acrescenta ao fim do
 * array. O banco da usuária tem os dados reais do negócio dela.
 */
const MIGRATIONS: readonly string[][] = [
  // v1 — schema inicial
  [
    `CREATE TABLE products (
      id                TEXT PRIMARY KEY NOT NULL,
      name              TEXT NOT NULL,
      description       TEXT NOT NULL DEFAULT '',
      unit              TEXT NOT NULL,
      unit_price_cents  INTEGER NOT NULL,
      archived_at       TEXT,
      created_at        TEXT NOT NULL,
      updated_at        TEXT NOT NULL
    )`,
    // Busca por nome é a operação mais frequente da tela de produtos.
    `CREATE INDEX idx_products_name ON products (name)`,
    // Produto arquivado some da lista, mas continua existindo para o histórico.
    `CREATE INDEX idx_products_archived ON products (archived_at)`,

    `CREATE TABLE customers (
      id                 TEXT PRIMARY KEY NOT NULL,
      name               TEXT NOT NULL,
      document           TEXT NOT NULL DEFAULT '',
      phone              TEXT NOT NULL DEFAULT '',
      email              TEXT NOT NULL DEFAULT '',
      address            TEXT NOT NULL DEFAULT '',
      district           TEXT NOT NULL DEFAULT '',
      city               TEXT NOT NULL DEFAULT '',
      state              TEXT NOT NULL DEFAULT '',
      zip_code           TEXT NOT NULL DEFAULT '',
      state_registration TEXT NOT NULL DEFAULT '',
      created_at         TEXT NOT NULL,
      updated_at         TEXT NOT NULL
    )`,
    `CREATE INDEX idx_customers_name ON customers (name)`,

    `CREATE TABLE quotes (
      id              TEXT PRIMARY KEY NOT NULL,
      number          INTEGER NOT NULL UNIQUE,
      status          TEXT NOT NULL,
      customer_id     TEXT NOT NULL REFERENCES customers (id),
      discount_cents  INTEGER NOT NULL DEFAULT 0,
      surcharge_cents INTEGER NOT NULL DEFAULT 0,
      notes           TEXT NOT NULL DEFAULT '',
      issued_at       TEXT NOT NULL,
      valid_until     TEXT NOT NULL,
      created_at      TEXT NOT NULL,
      updated_at      TEXT NOT NULL
    )`,
    `CREATE INDEX idx_quotes_issued_at ON quotes (issued_at)`,

    `CREATE TABLE quote_items (
      id               TEXT PRIMARY KEY NOT NULL,
      quote_id         TEXT NOT NULL REFERENCES quotes (id) ON DELETE CASCADE,
      product_id       TEXT REFERENCES products (id),
      description      TEXT NOT NULL,
      unit             TEXT NOT NULL,
      quantity         REAL NOT NULL,
      unit_price_cents INTEGER NOT NULL,
      position         INTEGER NOT NULL
    )`,
    `CREATE INDEX idx_quote_items_quote ON quote_items (quote_id)`,

    // Contador de numeração. Apagar um orçamento não pode reaproveitar o número:
    // dois documentos com o mesmo número na mão do cliente é problema real.
    `CREATE TABLE counters (
      name  TEXT PRIMARY KEY NOT NULL,
      value INTEGER NOT NULL
    )`,
    `INSERT INTO counters (name, value) VALUES ('quote_number', 0)`,
  ],
];

export const LATEST_SCHEMA_VERSION = MIGRATIONS.length;

export async function migrate(db: Database): Promise<number> {
  const [row] = await db.query<{ user_version: number }>("PRAGMA user_version");
  const current = row?.user_version ?? 0;

  if (current > LATEST_SCHEMA_VERSION) {
    throw new Error(
      `Banco na versão ${current}, mas este app entende até ${LATEST_SCHEMA_VERSION}. ` +
        "Provavelmente é uma versão mais nova do app — atualize antes de abrir.",
    );
  }

  for (let version = current; version < LATEST_SCHEMA_VERSION; version += 1) {
    const statements = MIGRATIONS[version];
    if (!statements) continue;

    await db.transaction(async (tx) => {
      for (const sql of statements) await tx.execute(sql);
    });

    // PRAGMA não aceita parâmetro vinculado; o valor vem do índice do laço,
    // nunca de entrada do usuário.
    await db.execute(`PRAGMA user_version = ${version + 1}`);
  }

  return LATEST_SCHEMA_VERSION;
}
