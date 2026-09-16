import type { CnpjLookupResult } from "@shared/cnpj";
import type { Result } from "@shared/result";
import type {
  Cents,
  Company,
  Customer,
  IsoDate,
  Product,
  Quote,
  QuoteStatus,
  UnitOfMeasure,
} from "@shared/types";

export interface ProductInput {
  name: string;
  description: string;
  unit: UnitOfMeasure;
  unitPrice: Cents;
}

export type CustomerInput = Omit<Customer, "id" | "createdAt" | "updatedAt">;

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

/**
 * `type` e não `interface` de propósito: o schema de RPC do Electrobun exige
 * assinatura de índice, e só um type alias satisfaz isso implicitamente.
 */
export type AppRequests = {
  listProducts: { params: { search: string }; response: Result<Product[]> };
  getProduct: { params: { id: string }; response: Result<Product | null> };
  createProduct: { params: { input: ProductInput }; response: Result<Product> };
  updateProduct: {
    params: { id: string; input: ProductInput };
    response: Result<Product>;
  };
  archiveProduct: { params: { id: string }; response: Result<null> };

  listCustomers: { params: { search: string }; response: Result<Customer[]> };
  getCustomer: { params: { id: string }; response: Result<Customer | null> };
  createCustomer: { params: { input: CustomerInput }; response: Result<Customer> };
  updateCustomer: {
    params: { id: string; input: CustomerInput };
    response: Result<Customer>;
  };

  nextQuoteNumber: { params: Record<string, never>; response: Result<number> };
  listQuotes: { params: { search: string }; response: Result<QuoteSummary[]> };
  getQuote: { params: { id: string }; response: Result<Quote | null> };
  createQuote: { params: { input: QuoteInput }; response: Result<Quote> };
  updateQuote: { params: { id: string; input: QuoteInput }; response: Result<Quote> };
  setQuoteStatus: {
    params: { id: string; status: QuoteStatus };
    response: Result<Quote>;
  };
  deleteQuote: { params: { id: string }; response: Result<null> };

  getCompany: { params: Record<string, never>; response: Result<Company> };
  updateCompany: { params: { input: Company }; response: Result<Company> };

  lookupCnpj: { params: { cnpj: string }; response: Result<CnpjLookupResult> };

  appInfo: {
    params: Record<string, never>;
    response: Result<{ version: string; databasePath: string }>;
  };
};
