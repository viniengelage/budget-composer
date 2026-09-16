import { onlyDigits } from "@shared/format";

export interface CompanyLookup {
  document: string;
  name: string;
  tradeName: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  isActive: boolean;
  registrationStatus: string;
}

export type CnpjLookupResult =
  | { status: "found"; company: CompanyLookup }
  | { status: "not-found" }
  | { status: "invalid" }
  | { status: "error"; reason: "timeout" | "network" | "unexpected-shape" };

export function isValidCnpjFormat(value: string): boolean {
  return onlyDigits(value).length === 14;
}
