import type { Db } from "@main/db/database";
import type { Customer } from "@shared/types";

interface CustomerRow {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  city: string;
  state: string;
  zip_code: string;
  state_registration: string;
  created_at: string;
  updated_at: string;
}

export type CustomerInput = Omit<Customer, "id" | "createdAt" | "updatedAt">;

export function toCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    document: row.document,
    phone: row.phone,
    email: row.email,
    address: row.address,
    district: row.district,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    stateRegistration: row.state_registration,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const CUSTOMER_COLUMNS = `id, name, document, phone, email, address, district, city, state, zip_code, state_registration, created_at, updated_at`;

export function listCustomers(db: Db, search = ""): Customer[] {
  const term = search.trim();

  if (term === "") {
    return db
      .all<CustomerRow>(
        `SELECT ${CUSTOMER_COLUMNS} FROM customers ORDER BY name COLLATE NOCASE`,
      )
      .map(toCustomer);
  }

  return db
    .all<CustomerRow>(
      `SELECT ${CUSTOMER_COLUMNS} FROM customers
        WHERE name LIKE ?1 OR document LIKE ?1 OR city LIKE ?1
        ORDER BY name COLLATE NOCASE`,
      [`%${term}%`],
    )
    .map(toCustomer);
}

export function getCustomer(db: Db, id: string): Customer | null {
  const row = db.get<CustomerRow>(
    `SELECT ${CUSTOMER_COLUMNS} FROM customers WHERE id = ?`,
    [id],
  );
  return row ? toCustomer(row) : null;
}

export function createCustomer(db: Db, input: CustomerInput): Customer {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO customers
       (id, name, document, phone, email, address, district, city, state, zip_code, state_registration, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.name,
      input.document,
      input.phone,
      input.email,
      input.address,
      input.district,
      input.city,
      input.state,
      input.zipCode,
      input.stateRegistration,
      now,
      now,
    ],
  );

  const created = getCustomer(db, id);
  if (!created) throw new Error("Não consegui salvar o cliente.");
  return created;
}

export function updateCustomer(db: Db, id: string, input: CustomerInput): Customer {
  const result = db.run(
    `UPDATE customers
        SET name = ?, document = ?, phone = ?, email = ?, address = ?, district = ?,
            city = ?, state = ?, zip_code = ?, state_registration = ?, updated_at = ?
      WHERE id = ?`,
    [
      input.name,
      input.document,
      input.phone,
      input.email,
      input.address,
      input.district,
      input.city,
      input.state,
      input.zipCode,
      input.stateRegistration,
      new Date().toISOString(),
      id,
    ],
  );

  if (result.changes === 0) throw new Error("Este cliente não existe mais.");

  const updated = getCustomer(db, id);
  if (!updated) throw new Error("Não consegui ler o cliente depois de salvar.");
  return updated;
}
