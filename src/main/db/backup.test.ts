import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { backupDatabase, listBackups } from "@main/db/backup";
import { openDatabase, type Db } from "@main/db/database";
import { migrate } from "@main/db/migrations";

let directory = "";
let db: Db;

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "orcamentos-backup-"));
  db = openDatabase(join(directory, "origem.db"));
  migrate(db);
});

afterEach(() => {
  db.close();
  rmSync(directory, { recursive: true, force: true });
});

function addProduct(name: string) {
  const now = new Date().toISOString();
  db.run(
    `INSERT INTO products (id, name, description, unit, unit_price_cents, created_at, updated_at)
     VALUES (?, ?, '', 'm2', 1250, ?, ?)`,
    [crypto.randomUUID(), name, now, now],
  );
}

describe("backup do banco", () => {
  test("a cópia abre e tem os dados", () => {
    addProduct("Grama esmeralda");

    const target = backupDatabase(db, join(directory, "backups"));

    const copy = openDatabase(target);
    const rows = copy.all<{ name: string }>("SELECT name FROM products");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.name).toBe("Grama esmeralda");
    copy.close();
  });

  /**
   * Este é o teste que justifica usar VACUUM INTO em vez de copiar o arquivo.
   * Com WAL, a escrita mais recente ainda está no `-wal` na hora do backup.
   */
  test("inclui escrita que ainda está no WAL", () => {
    addProduct("Escrito agora");

    const target = backupDatabase(db, join(directory, "backups"));

    const copy = openDatabase(target);
    expect(copy.all("SELECT id FROM products")).toHaveLength(1);
    copy.close();
  });

  test("o backup é uma foto: mudança depois não entra", () => {
    addProduct("Antes");
    const target = backupDatabase(db, join(directory, "backups"));
    addProduct("Depois");

    const copy = openDatabase(target);
    expect(copy.all("SELECT id FROM products")).toHaveLength(1);
    copy.close();
  });

  test("guarda os 5 mais novos e apaga o resto", () => {
    const backups = join(directory, "backups");

    for (let index = 0; index < 8; index += 1) {
      backupDatabase(db, backups, new Date(Date.UTC(2026, 0, index + 1)));
    }

    const kept = listBackups(backups);
    expect(kept).toHaveLength(5);
    expect(kept[0]).toContain("2026-01-04");
    expect(kept[4]).toContain("2026-01-08");
  });

  test("pasta que ainda não existe é criada", () => {
    const target = backupDatabase(db, join(directory, "nova", "pasta"));
    expect(target).toContain("nova");
    expect(listBackups(join(directory, "nova", "pasta"))).toHaveLength(1);
  });

  test("listar pasta inexistente devolve lista vazia, não estoura", () => {
    expect(listBackups(join(directory, "nao-existe"))).toEqual([]);
  });
});
