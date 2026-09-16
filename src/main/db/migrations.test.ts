import { describe, expect, test } from "bun:test";

import { openDatabase } from "@main/db/database";
import { LATEST_SCHEMA_VERSION, migrate } from "@main/db/migrations";

function freshDatabase() {
  const db = openDatabase(":memory:");
  migrate(db);
  return db;
}

describe("migrate", () => {
  test("cria o esquema e grava a versão", () => {
    const db = freshDatabase();

    const row = db.get<{ user_version: number }>("PRAGMA user_version");
    expect(row?.user_version).toBe(LATEST_SCHEMA_VERSION);

    const tables = db
      .all<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
      )
      .map((table) => table.name);

    expect(tables).toContain("products");
    expect(tables).toContain("customers");
    expect(tables).toContain("quotes");
    expect(tables).toContain("quote_items");
    expect(tables).toContain("counters");
    expect(tables).toContain("company");

    db.close();
  });

  test("rodar duas vezes não quebra nem duplica dados", () => {
    const db = freshDatabase();
    migrate(db);

    const counters = db.all<{ name: string }>("SELECT name FROM counters");
    expect(counters).toHaveLength(1);

    const company = db.all<{ id: number }>("SELECT id FROM company");
    expect(company).toHaveLength(1);

    db.close();
  });

  test("recusa banco de uma versão mais nova que a do app", () => {
    const db = freshDatabase();
    db.exec(`PRAGMA user_version = ${LATEST_SCHEMA_VERSION + 5}`);

    expect(() => migrate(db)).toThrow(/versão mais nova/);

    db.close();
  });

  test("apagar orçamento leva os itens junto", () => {
    const db = freshDatabase();
    const now = new Date().toISOString();

    db.run(
      "INSERT INTO customers (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)",
      ["c1", "Maria D'Ávila", now, now],
    );
    db.run(
      `INSERT INTO quotes (id, number, status, customer_id, issued_at, valid_until, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ["q1", 1, "pending", "c1", "2026-08-01", "2026-08-16", now, now],
    );
    db.run(
      `INSERT INTO quote_items (id, quote_id, product_id, description, unit, quantity, unit_price_cents, position)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ["i1", "q1", null, "Grama esmeralda", "m2", 120, 1250, 0],
    );

    db.run("DELETE FROM quotes WHERE id = ?", ["q1"]);

    expect(db.all("SELECT id FROM quote_items")).toHaveLength(0);
    expect(db.get<{ name: string }>("SELECT name FROM customers")?.name).toBe(
      "Maria D'Ávila",
    );

    db.close();
  });
});
