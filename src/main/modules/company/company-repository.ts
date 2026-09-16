import type { Db } from "@main/db/database";
import type { Company } from "@shared/types";

interface CompanyRow {
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  city: string;
  state: string;
  zip_code: string;
  pix_key: string;
  pix_holder: string;
  logo_uri: string | null;
  default_validity_days: number;
}

export const EMPTY_COMPANY: Company = {
  name: "",
  document: "",
  phone: "",
  email: "",
  address: "",
  district: "",
  city: "",
  state: "",
  zipCode: "",
  pixKey: "",
  pixHolder: "",
  logoUri: null,
  defaultValidityDays: 15,
};

export function getCompany(db: Db): Company {
  const row = db.get<CompanyRow>(
    `SELECT name, document, phone, email, address, district, city, state, zip_code,
            pix_key, pix_holder, logo_uri, default_validity_days
       FROM company WHERE id = 1`,
  );

  if (!row) return EMPTY_COMPANY;

  return {
    name: row.name,
    document: row.document,
    phone: row.phone,
    email: row.email,
    address: row.address,
    district: row.district,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    pixKey: row.pix_key,
    pixHolder: row.pix_holder,
    logoUri: row.logo_uri,
    defaultValidityDays: row.default_validity_days,
  };
}

export function updateCompany(db: Db, input: Company): Company {
  db.run(
    `UPDATE company
        SET name = ?, document = ?, phone = ?, email = ?, address = ?, district = ?,
            city = ?, state = ?, zip_code = ?, pix_key = ?, pix_holder = ?,
            logo_uri = ?, default_validity_days = ?
      WHERE id = 1`,
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
      input.pixKey,
      input.pixHolder,
      input.logoUri,
      Math.max(1, Math.round(input.defaultValidityDays)),
    ],
  );

  return getCompany(db);
}
