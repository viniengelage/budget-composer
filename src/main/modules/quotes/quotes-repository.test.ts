import { beforeEach, describe, expect, test } from "bun:test";

import { openDatabase, type Db } from "@main/db/database";
import { migrate } from "@main/db/migrations";
import {
  createQuote,
  deleteQuote,
  getQuote,
  listQuotes,
  setQuoteStatus,
  updateQuote,
  type QuoteInput,
} from "@main/modules/quotes/quotes-repository";

let db: Db;

beforeEach(() => {
  db = openDatabase(":memory:");
  migrate(db);
});

function quoteInput(overrides: Partial<QuoteInput> = {}): QuoteInput {
  return {
    customer: {
      id: null,
      name: "Espaço das Américas",
      document: "12345678000190",
      phone: "45999998888",
      email: "",
      address: "Av. das Cataratas, 1200",
      district: "Centro",
      city: "Foz do Iguaçu",
      state: "PR",
      zipCode: "85850000",
      stateRegistration: "",
    },
    items: [
      {
        productId: null,
        description: "Grama esmeralda",
        unit: "m2",
        quantity: 120,
        unitPrice: 1250,
      },
      {
        productId: null,
        description: "Adubo",
        unit: "saco",
        quantity: 3,
        unitPrice: 8900,
      },
    ],
    discount: 0,
    surcharge: 0,
    notes: "",
    issuedAt: "2026-08-01",
    validUntil: "2026-08-16",
    status: "pending",
    ...overrides,
  };
}

describe("orçamentos", () => {
  test("numera em sequência a partir de 1", () => {
    expect(createQuote(db, quoteInput()).number).toBe(1);
    expect(createQuote(db, quoteInput()).number).toBe(2);
    expect(createQuote(db, quoteInput()).number).toBe(3);
  });

  test("cria o cliente junto quando ele ainda não existe", () => {
    const quote = createQuote(db, quoteInput());

    expect(quote.customer.id).toBeString();
    expect(quote.customer.city).toBe("Foz do Iguaçu");
  });

  test("guarda os itens na ordem em que foram digitados", () => {
    const quote = createQuote(db, quoteInput());

    expect(quote.items.map((item) => item.description)).toEqual([
      "Grama esmeralda",
      "Adubo",
    ]);
  });

  test("o total da lista soma item a item", () => {
    createQuote(db, quoteInput());

    const [summary] = listQuotes(db);
    expect(summary?.total).toBe(120 * 1250 + 3 * 8900);
    expect(summary?.itemCount).toBe(2);
  });

  test("desconto entra no total da lista", () => {
    createQuote(db, quoteInput({ discount: 5000 }));

    expect(listQuotes(db)[0]?.total).toBe(120 * 1250 + 3 * 8900 - 5000);
  });

  test("lista em ordem decrescente de número", () => {
    createQuote(db, quoteInput());
    createQuote(db, quoteInput());

    expect(listQuotes(db).map((quote) => quote.number)).toEqual([2, 1]);
  });

  test("busca por nome do cliente e por número", () => {
    createQuote(db, quoteInput());

    expect(listQuotes(db, "Américas")).toHaveLength(1);
    expect(listQuotes(db, "1")).toHaveLength(1);
    expect(listQuotes(db, "Zebra")).toHaveLength(0);
  });

  test("editar troca os itens sem deixar órfãos", () => {
    const quote = createQuote(db, quoteInput());

    const updated = updateQuote(db, quote.id, {
      ...quoteInput(),
      customer: { ...quoteInput().customer, id: quote.customer.id },
      items: [
        {
          productId: null,
          description: "Só grama",
          unit: "m2",
          quantity: 10,
          unitPrice: 1250,
        },
      ],
    });

    expect(updated.items).toHaveLength(1);
    expect(db.all("SELECT id FROM quote_items")).toHaveLength(1);
  });

  test("editar não renumera o orçamento", () => {
    const first = createQuote(db, quoteInput());
    createQuote(db, quoteInput());

    const updated = updateQuote(db, first.id, {
      ...quoteInput(),
      customer: { ...quoteInput().customer, id: first.customer.id },
    });

    expect(updated.number).toBe(1);
  });

  test("muda a situação", () => {
    const quote = createQuote(db, quoteInput());

    expect(setQuoteStatus(db, quote.id, "approved").status).toBe("approved");
  });

  test("apagar leva os itens junto", () => {
    const quote = createQuote(db, quoteInput());
    deleteQuote(db, quote.id);

    expect(getQuote(db, quote.id)).toBeNull();
    expect(db.all("SELECT id FROM quote_items")).toHaveLength(0);
  });

  test("apagar duas vezes avisa", () => {
    const quote = createQuote(db, quoteInput());
    deleteQuote(db, quote.id);

    expect(() => deleteQuote(db, quote.id)).toThrow(/já foi apagado/);
  });
});
