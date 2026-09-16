import { describe, expect, test } from "bun:test";

import {
  validateQuoteDraft,
  type QuoteDraft,
} from "@/features/quotes/types/quote-schema";

function draft(overrides: Partial<QuoteDraft> = {}): QuoteDraft {
  return {
    customer: {
      id: null,
      name: "Espaço das Américas",
      document: "12345678000190",
      phone: "4530251180",
      email: "",
      address: "Av. das Cataratas, 1.500",
      district: "Três Fronteiras",
      city: "Foz do Iguaçu",
      state: "PR",
      zipCode: "85850000",
      stateRegistration: "",
    },
    items: [
      {
        key: "a",
        productId: null,
        description: "Grama esmeralda",
        unit: "m2",
        quantity: 250,
        unitPrice: 900,
      },
    ],
    discount: 0,
    surcharge: 0,
    notes: "",
    ...overrides,
  };
}

describe("rascunho de orçamento", () => {
  test("um orçamento preenchido passa", () => {
    expect(validateQuoteDraft(draft())).toBeNull();
  });

  test("cliente sem nome é barrado, com a frase que a tela mostra", () => {
    const errors = validateQuoteDraft(
      draft({ customer: { ...draft().customer, name: "   " } }),
    );

    expect(errors?.["customer.name"]).toBe("Escreva o nome do cliente.");
  });

  test("orçamento sem item nenhum é barrado", () => {
    expect(validateQuoteDraft(draft({ items: [] }))?.["items"]).toBe(
      "Adicione pelo menos um item ao orçamento.",
    );
  });

  test("o erro aponta a linha exata do item", () => {
    const errors = validateQuoteDraft(
      draft({
        items: [
          { ...draft().items[0]!, key: "a" },
          { ...draft().items[0]!, key: "b", quantity: 0 },
        ],
      }),
    );

    expect(errors?.["items.1.quantity"]).toBe("Digite a quantidade deste item.");
    expect(errors?.["items.0.quantity"]).toBeUndefined();
  });

  test("item à mão sem descrição é barrado", () => {
    const errors = validateQuoteDraft(
      draft({ items: [{ ...draft().items[0]!, description: "  " }] }),
    );

    expect(errors?.["items.0.description"]).toBe("Escreva o que é este item.");
  });

  test("item com valor zerado é barrado", () => {
    const errors = validateQuoteDraft(
      draft({ items: [{ ...draft().items[0]!, unitPrice: 0 }] }),
    );

    expect(errors?.["items.0.unitPrice"]).toBe("Digite o valor deste item.");
  });

  test("cliente só com nome basta — o resto é opcional", () => {
    const bare = draft({
      customer: {
        id: null,
        name: "João",
        document: "",
        phone: "",
        email: "",
        address: "",
        district: "",
        city: "",
        state: "",
        zipCode: "",
        stateRegistration: "",
      },
    });

    expect(validateQuoteDraft(bare)).toBeNull();
  });

  test("nenhuma mensagem vaza jargão de programador", () => {
    const jargon = /required|invalid|string|number|expected|array|type/i;
    const errors = validateQuoteDraft(
      draft({
        customer: { ...draft().customer, name: "" },
        items: [],
      }),
    );

    for (const message of Object.values(errors ?? {})) {
      expect(message).not.toMatch(jargon);
    }
  });
});
