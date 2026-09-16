/** Tipos de domínio compartilhados entre features. */

/**
 * Dinheiro é representado em CENTAVOS (inteiro), nunca em float.
 * `0.1 + 0.2 !== 0.3` — um orçamento errado por um centavo é um bug real
 * de negócio, então o domínio inteiro trabalha em centavos e só formata
 * para exibição.
 */
export type Cents = number;

/** Data no formato ISO `YYYY-MM-DD`, sem fuso horário. */
export type IsoDate = string;

export type UnitOfMeasure = "m2" | "m" | "un" | "saco" | "servico" | "hora";

export type QuoteStatus = "pending" | "approved" | "expired" | "rejected";

export interface Product {
  id: string;
  name: string;
  /** Descrição que sai impressa no orçamento. Cai para `name` se vazia. */
  description: string;
  unit: UnitOfMeasure;
  unitPrice: Cents;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  stateRegistration: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id: string;
  /** Snapshot: o item guarda os valores do momento da venda. */
  productId: string | null;
  description: string;
  unit: UnitOfMeasure;
  quantity: number;
  unitPrice: Cents;
}

export interface Quote {
  id: string;
  number: number;
  status: QuoteStatus;
  customer: Customer;
  items: QuoteItem[];
  discount: Cents;
  surcharge: Cents;
  notes: string;
  issuedAt: IsoDate;
  validUntil: IsoDate;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  pixKey: string;
  pixHolder: string;
  /** Caminho local ou data-URI do logo. */
  logoUri: string | null;
  /** Dias de validade padrão dos novos orçamentos. */
  defaultValidityDays: number;
}
