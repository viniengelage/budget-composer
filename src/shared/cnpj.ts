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
  return cnpjDigits(value).length === 14;
}

/**
 * Normaliza qualquer coisa que a pessoa digite ou cole num CNPJ: joga fora
 * pontuação e corta em 14 dígitos.
 *
 * O corte importa mais do que parece. Sem ele, um 15º dígito fica guardado no
 * estado sem aparecer na máscara — a tela mostra um CNPJ completo e correto, e
 * a busca na Receita nunca dispara, porque internamente o valor tem 15 dígitos.
 */
export function cnpjDigits(value: string): string {
  return onlyDigits(value).slice(0, 14);
}
