import { databaseLocation, getDatabase } from "@main/db/connection";
import {
  getCompany,
  updateCompany,
} from "@main/modules/company/company-repository";
import {
  createCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from "@main/modules/customers/customers-repository";
import {
  archiveProduct,
  createProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "@main/modules/products/products-repository";
import {
  createQuote,
  deleteQuote,
  getQuote,
  listQuotes,
  peekNextQuoteNumber,
  setQuoteStatus,
  updateQuote,
} from "@main/modules/quotes/quotes-repository";
import { lookupCnpj } from "@main/services/cnpj/brasil-api";
import { APP_VERSION } from "@shared/app-info";
import { attempt, attemptAsync } from "@shared/result";
import type { AppRequests } from "@shared/rpc-contract";

type Handlers = {
  [K in keyof AppRequests]: (
    params: AppRequests[K]["params"],
  ) => AppRequests[K]["response"] | Promise<AppRequests[K]["response"]>;
};

export const requestHandlers: Handlers = {
  listProducts: ({ search }) => attempt(() => listProducts(getDatabase(), search)),
  getProduct: ({ id }) => attempt(() => getProduct(getDatabase(), id)),
  createProduct: ({ input }) => attempt(() => createProduct(getDatabase(), input)),
  updateProduct: ({ id, input }) =>
    attempt(() => updateProduct(getDatabase(), id, input)),
  archiveProduct: ({ id }) =>
    attempt(() => {
      archiveProduct(getDatabase(), id);
      return null;
    }),

  listCustomers: ({ search }) => attempt(() => listCustomers(getDatabase(), search)),
  getCustomer: ({ id }) => attempt(() => getCustomer(getDatabase(), id)),
  createCustomer: ({ input }) => attempt(() => createCustomer(getDatabase(), input)),
  updateCustomer: ({ id, input }) =>
    attempt(() => updateCustomer(getDatabase(), id, input)),

  nextQuoteNumber: () => attempt(() => peekNextQuoteNumber(getDatabase())),
  listQuotes: ({ search }) => attempt(() => listQuotes(getDatabase(), search)),
  getQuote: ({ id }) => attempt(() => getQuote(getDatabase(), id)),
  createQuote: ({ input }) => attempt(() => createQuote(getDatabase(), input)),
  updateQuote: ({ id, input }) => attempt(() => updateQuote(getDatabase(), id, input)),
  setQuoteStatus: ({ id, status }) =>
    attempt(() => setQuoteStatus(getDatabase(), id, status)),
  deleteQuote: ({ id }) =>
    attempt(() => {
      deleteQuote(getDatabase(), id);
      return null;
    }),

  getCompany: () => attempt(() => getCompany(getDatabase())),
  updateCompany: ({ input }) => attempt(() => updateCompany(getDatabase(), input)),

  lookupCnpj: ({ cnpj }) => attemptAsync(() => lookupCnpj(cnpj)),

  appInfo: () =>
    attempt(() => ({ version: APP_VERSION, databasePath: databaseLocation() })),
};
