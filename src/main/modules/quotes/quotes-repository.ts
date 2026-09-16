import type { Db } from "@main/db/database";
import {
  CUSTOMER_COLUMNS,
  createCustomer,
  toCustomer,
  updateCustomer,
  type CustomerInput,
} from "@main/modules/customers/customers-repository";
import { calculateQuoteTotals } from "@shared/quote-totals";
import type {
  Cents,
  IsoDate,
  Quote,
  QuoteItem,
  QuoteStatus,
  UnitOfMeasure,
} from "@shared/types";

interface QuoteRow {
  id: string;
  number: number;
  status: string;
  customer_id: string;
  discount_cents: number;
  surcharge_cents: number;
  notes: string;
  issued_at: string;
  valid_until: string;
  created_at: string;
  updated_at: string;
}

interface QuoteItemRow {
  id: string;
  quote_id: string;
  product_id: string | null;
  description: string;
  unit: string;
  quantity: number;
  unit_price_cents: number;
}

export interface QuoteItemInput {
  productId: string | null;
  description: string;
  unit: UnitOfMeasure;
  quantity: number;
  unitPrice: Cents;
}

export interface QuoteInput {
  customer: CustomerInput & { id: string | null };
  items: QuoteItemInput[];
  discount: Cents;
  surcharge: Cents;
  notes: string;
  issuedAt: IsoDate;
  validUntil: IsoDate;
  status: QuoteStatus;
}

export interface QuoteSummary {
  id: string;
  number: number;
  status: QuoteStatus;
  customerName: string;
  customerCity: string;
  issuedAt: IsoDate;
  validUntil: IsoDate;
  itemCount: number;
  total: Cents;
}

const QUOTE_COLUMNS = `id, number, status, customer_id, discount_cents, surcharge_cents, notes, issued_at, valid_until, created_at, updated_at`;
const ITEM_COLUMNS = `id, quote_id, product_id, description, unit, quantity, unit_price_cents`;

function toItem(row: QuoteItemRow): QuoteItem {
  return {
    id: row.id,
    productId: row.product_id,
    description: row.description,
    unit: row.unit as UnitOfMeasure,
    quantity: row.quantity,
    unitPrice: row.unit_price_cents,
  };
}

export function listQuotes(db: Db, search = ""): QuoteSummary[] {
  const term = search.trim();
  const where = term === "" ? "" : `WHERE c.name LIKE ?1 OR CAST(q.number AS TEXT) LIKE ?1`;

  const rows = db.all<{
    id: string;
    number: number;
    status: string;
    customer_name: string;
    customer_city: string;
    discount_cents: number;
    surcharge_cents: number;
    issued_at: string;
    valid_until: string;
  }>(
    `SELECT q.id, q.number, q.status, c.name AS customer_name, c.city AS customer_city,
            q.discount_cents, q.surcharge_cents, q.issued_at, q.valid_until
       FROM quotes q
       JOIN customers c ON c.id = q.customer_id
       ${where}
      ORDER BY q.number DESC`,
    term === "" ? [] : [`%${term}%`],
  );

  if (rows.length === 0) return [];

  const items = db.all<QuoteItemRow>(`SELECT ${ITEM_COLUMNS} FROM quote_items`);
  const byQuote = new Map<string, QuoteItem[]>();
  for (const row of items) {
    const list = byQuote.get(row.quote_id) ?? [];
    list.push(toItem(row));
    byQuote.set(row.quote_id, list);
  }

  return rows.map((row) => {
    const quoteItems = byQuote.get(row.id) ?? [];
    const totals = calculateQuoteTotals(
      quoteItems,
      row.discount_cents,
      row.surcharge_cents,
    );

    return {
      id: row.id,
      number: row.number,
      status: row.status as QuoteStatus,
      customerName: row.customer_name,
      customerCity: row.customer_city,
      issuedAt: row.issued_at,
      validUntil: row.valid_until,
      itemCount: quoteItems.length,
      total: totals.total,
    };
  });
}

export function getQuote(db: Db, id: string): Quote | null {
  const row = db.get<QuoteRow>(`SELECT ${QUOTE_COLUMNS} FROM quotes WHERE id = ?`, [id]);
  if (!row) return null;

  const customerRow = db.get<Parameters<typeof toCustomer>[0]>(
    `SELECT ${CUSTOMER_COLUMNS} FROM customers WHERE id = ?`,
    [row.customer_id],
  );
  if (!customerRow) return null;

  const items = db
    .all<QuoteItemRow>(
      `SELECT ${ITEM_COLUMNS} FROM quote_items WHERE quote_id = ? ORDER BY position`,
      [id],
    )
    .map(toItem);

  return {
    id: row.id,
    number: row.number,
    status: row.status as QuoteStatus,
    customer: toCustomer(customerRow),
    items,
    discount: row.discount_cents,
    surcharge: row.surcharge_cents,
    notes: row.notes,
    issuedAt: row.issued_at,
    validUntil: row.valid_until,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Só espia: não consome o contador. Serve para a tela mostrar "Nº 254"
 * enquanto a pessoa preenche. O número de verdade é atribuído no save, dentro
 * da transação — se dois orçamentos forem criados, nenhum repete.
 */
export function peekNextQuoteNumber(db: Db): number {
  const row = db.get<{ value: number }>(
    "SELECT value FROM counters WHERE name = 'quote_number'",
  );
  return (row?.value ?? 0) + 1;
}

function nextQuoteNumber(db: Db): number {
  db.run("UPDATE counters SET value = value + 1 WHERE name = 'quote_number'");
  const row = db.get<{ value: number }>(
    "SELECT value FROM counters WHERE name = 'quote_number'",
  );
  if (!row) throw new Error("Não consegui gerar o número do orçamento.");
  return row.value;
}

function writeItems(db: Db, quoteId: string, items: QuoteItemInput[]): void {
  db.run("DELETE FROM quote_items WHERE quote_id = ?", [quoteId]);

  items.forEach((item, position) => {
    db.run(
      `INSERT INTO quote_items
         (id, quote_id, product_id, description, unit, quantity, unit_price_cents, position)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        quoteId,
        item.productId,
        item.description,
        item.unit,
        item.quantity,
        item.unitPrice,
        position,
      ],
    );
  });
}

function resolveCustomerId(db: Db, customer: QuoteInput["customer"]): string {
  const { id, ...fields } = customer;
  if (id === null) return createCustomer(db, fields).id;
  return updateCustomer(db, id, fields).id;
}

export function createQuote(db: Db, input: QuoteInput): Quote {
  const id = crypto.randomUUID();

  db.transaction(() => {
    const customerId = resolveCustomerId(db, input.customer);
    const number = nextQuoteNumber(db);
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO quotes
         (id, number, status, customer_id, discount_cents, surcharge_cents, notes,
          issued_at, valid_until, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        number,
        input.status,
        customerId,
        input.discount,
        input.surcharge,
        input.notes,
        input.issuedAt,
        input.validUntil,
        now,
        now,
      ],
    );

    writeItems(db, id, input.items);
  });

  const created = getQuote(db, id);
  if (!created) throw new Error("Não consegui salvar o orçamento.");
  return created;
}

export function updateQuote(db: Db, id: string, input: QuoteInput): Quote {
  db.transaction(() => {
    const customerId = resolveCustomerId(db, input.customer);

    const result = db.run(
      `UPDATE quotes
          SET status = ?, customer_id = ?, discount_cents = ?, surcharge_cents = ?,
              notes = ?, issued_at = ?, valid_until = ?, updated_at = ?
        WHERE id = ?`,
      [
        input.status,
        customerId,
        input.discount,
        input.surcharge,
        input.notes,
        input.issuedAt,
        input.validUntil,
        new Date().toISOString(),
        id,
      ],
    );

    if (result.changes === 0) throw new Error("Este orçamento não existe mais.");

    writeItems(db, id, input.items);
  });

  const updated = getQuote(db, id);
  if (!updated) throw new Error("Não consegui ler o orçamento depois de salvar.");
  return updated;
}

export function setQuoteStatus(db: Db, id: string, status: QuoteStatus): Quote {
  const result = db.run("UPDATE quotes SET status = ?, updated_at = ? WHERE id = ?", [
    status,
    new Date().toISOString(),
    id,
  ]);

  if (result.changes === 0) throw new Error("Este orçamento não existe mais.");

  const updated = getQuote(db, id);
  if (!updated) throw new Error("Não consegui ler o orçamento depois de salvar.");
  return updated;
}

export function deleteQuote(db: Db, id: string): void {
  const result = db.run("DELETE FROM quotes WHERE id = ?", [id]);
  if (result.changes === 0) throw new Error("Este orçamento já foi apagado.");
}
