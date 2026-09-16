import { describe, expect, test } from "bun:test";

import { bunDriver } from "@/lib/db/driver.bun";
import { LATEST_SCHEMA_VERSION, migrate } from "@/lib/db/migrations";

async function freshDb() {
  const db = await bunDriver.open(":memory:");
  await migrate(db);
  return db;
}

describe("migrate", () => {
  test("cria o schema e marca a versão", async () => {
    const db = await bunDriver.open(":memory:");
    const version = await migrate(db);

    expect(version).toBe(LATEST_SCHEMA_VERSION);

    const [row] = await db.query<{ user_version: number }>("PRAGMA user_version");
    expect(row?.user_version).toBe(LATEST_SCHEMA_VERSION);
    await db.close();
  });

  test("é idempotente — rodar de novo não quebra nem duplica", async () => {
    const db = await freshDb();
    await migrate(db);
    await migrate(db);

    const tables = await db.query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    );
    const names = tables.map((t) => t.name);

    expect(names).toContain("products");
    expect(names).toContain("customers");
    expect(names).toContain("quotes");
    expect(names).toContain("quote_items");
    expect(names).toContain("counters");
    await db.close();
  });

  test("recusa banco de uma versão mais nova em vez de corromper", async () => {
    const db = await bunDriver.open(":memory:");
    await db.execute("PRAGMA user_version = 999");

    await expect(migrate(db)).rejects.toThrow(/versão mais nova/);
    await db.close();
  });
});

describe("schema", () => {
  test("dinheiro é INTEGER — nunca REAL", async () => {
    const db = await freshDb();
    const columns = await db.query<{ name: string; type: string }>(
      "PRAGMA table_info(products)",
    );

    const price = columns.find((c) => c.name === "unit_price_cents");
    expect(price?.type).toBe("INTEGER");
    await db.close();
  });

  test("número de orçamento é único", async () => {
    const db = await freshDb();
    const now = new Date().toISOString();

    await db.execute(
      `INSERT INTO customers (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`,
      ["c1", "Espaço das Américas", now, now],
    );
    const insertQuote = (id: string, number: number) =>
      db.execute(
        `INSERT INTO quotes (id, number, status, customer_id, issued_at, valid_until, created_at, updated_at)
         VALUES (?, ?, 'pending', 'c1', '2026-08-01', '2026-09-01', ?, ?)`,
        [id, number, now, now],
      );

    await insertQuote("q1", 253);
    await expect(insertQuote("q2", 253)).rejects.toThrow();
    await db.close();
  });

  test("apagar orçamento leva os itens junto", async () => {
    const db = await freshDb();
    const now = new Date().toISOString();

    await db.execute(
      `INSERT INTO customers (id, name, created_at, updated_at) VALUES ('c1', 'Cliente', ?, ?)`,
      [now, now],
    );
    await db.execute(
      `INSERT INTO quotes (id, number, status, customer_id, issued_at, valid_until, created_at, updated_at)
       VALUES ('q1', 1, 'pending', 'c1', '2026-08-01', '2026-09-01', ?, ?)`,
      [now, now],
    );
    await db.execute(
      `INSERT INTO quote_items (id, quote_id, description, unit, quantity, unit_price_cents, position)
       VALUES ('i1', 'q1', 'Grama esmeralda', 'm2', 250, 900, 0)`,
    );

    await db.execute("DELETE FROM quotes WHERE id = 'q1'");
    const items = await db.query("SELECT * FROM quote_items");

    expect(items).toHaveLength(0);
    await db.close();
  });
});

describe("transaction", () => {
  test("faz rollback quando algo falha no meio", async () => {
    const db = await freshDb();
    const now = new Date().toISOString();

    await expect(
      db.transaction(async (tx) => {
        await tx.execute(
          `INSERT INTO products (id, name, unit, unit_price_cents, created_at, updated_at)
           VALUES ('p1', 'Grama esmeralda', 'm2', 900, ?, ?)`,
          [now, now],
        );
        throw new Error("falha no meio da transação");
      }),
    ).rejects.toThrow("falha no meio");

    const products = await db.query("SELECT * FROM products");
    expect(products).toHaveLength(0);
    await db.close();
  });
});
