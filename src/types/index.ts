export type Cents = number;

export type IsoDate = string;

export type UnitOfMeasure = "m2" | "m" | "un" | "saco" | "servico" | "hora";

export type QuoteStatus = "pending" | "approved" | "expired" | "rejected";

export interface Product {
  id: string;
  name: string;
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
  logoUri: string | null;
  defaultValidityDays: number;
}
