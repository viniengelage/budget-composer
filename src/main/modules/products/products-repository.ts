import type { Db } from "@main/db/database";
import type { Cents, Product, UnitOfMeasure } from "@shared/types";

interface ProductRow {
  id: string;
  name: string;
  description: string;
  unit: string;
  unit_price_cents: number;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  name: string;
  description: string;
  unit: UnitOfMeasure;
  unitPrice: Cents;
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    unit: row.unit as UnitOfMeasure,
    unitPrice: row.unit_price_cents,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SELECT = `SELECT id, name, description, unit, unit_price_cents, created_at, updated_at FROM products`;

export function listProducts(db: Db, search = ""): Product[] {
  const term = search.trim();

  if (term === "") {
    return db
      .all<ProductRow>(`${SELECT} WHERE archived_at IS NULL ORDER BY name COLLATE NOCASE`)
      .map(toProduct);
  }

  return db
    .all<ProductRow>(
      `${SELECT} WHERE archived_at IS NULL AND (name LIKE ?1 OR description LIKE ?1)
       ORDER BY name COLLATE NOCASE`,
      [`%${term}%`],
    )
    .map(toProduct);
}

export function getProduct(db: Db, id: string): Product | null {
  const row = db.get<ProductRow>(`${SELECT} WHERE id = ?`, [id]);
  return row ? toProduct(row) : null;
}

export function createProduct(db: Db, input: ProductInput): Product {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO products (id, name, description, unit, unit_price_cents, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, input.name, input.description, input.unit, input.unitPrice, now, now],
  );

  const created = getProduct(db, id);
  if (!created) throw new Error("Não consegui salvar o produto.");
  return created;
}

export function updateProduct(db: Db, id: string, input: ProductInput): Product {
  const now = new Date().toISOString();

  const result = db.run(
    `UPDATE products
        SET name = ?, description = ?, unit = ?, unit_price_cents = ?, updated_at = ?
      WHERE id = ? AND archived_at IS NULL`,
    [input.name, input.description, input.unit, input.unitPrice, now, id],
  );

  if (result.changes === 0) throw new Error("Este produto não existe mais.");

  const updated = getProduct(db, id);
  if (!updated) throw new Error("Não consegui ler o produto depois de salvar.");
  return updated;
}

/**
 * Arquiva em vez de apagar: orçamentos antigos apontam para o produto e
 * precisam continuar imprimindo a mesma linha que o cliente recebeu.
 */
export function archiveProduct(db: Db, id: string): void {
  const result = db.run(
    `UPDATE products SET archived_at = ?, updated_at = ? WHERE id = ? AND archived_at IS NULL`,
    [new Date().toISOString(), new Date().toISOString(), id],
  );

  if (result.changes === 0) throw new Error("Este produto já foi removido.");
}
