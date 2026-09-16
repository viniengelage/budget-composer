import { describe, expect, test } from "bun:test";

import {
  calculateItemTotal,
  calculateQuoteTotals,
  calculateSubtotal,
} from "@shared/quote-totals";
import type { QuoteItem } from "@shared/types";

function item(quantity: number, unitPrice: number, id = "1"): QuoteItem {
  return {
    id,
    productId: null,
    description: "Item",
    unit: "m2",
    quantity,
    unitPrice,
  };
}

describe("calculateItemTotal", () => {
  test("multiplica quantidade por preço unitário", () => {
    expect(calculateItemTotal(item(250, 900))).toBe(225000);
    expect(calculateItemTotal(item(1, 15000))).toBe(15000);
  });

  test("arredonda quantidade fracionada para o centavo", () => {
    expect(calculateItemTotal(item(12.5, 180))).toBe(2250);
    expect(calculateItemTotal(item(3, 33.5))).toBe(101);
  });

  test("não acumula erro de ponto flutuante", () => {
    expect(calculateItemTotal(item(3, 10))).toBe(30);
    expect(calculateItemTotal(item(0.3, 100))).toBe(30);
  });
});

describe("calculateSubtotal", () => {
  test("soma os itens do orçamento de referência", () => {
    const items = [item(250, 900, "a"), item(250, 180, "b"), item(1, 15000, "c")];
    expect(calculateSubtotal(items)).toBe(285000);
  });

  test("lista vazia soma zero", () => {
    expect(calculateSubtotal([])).toBe(0);
  });
});

describe("calculateQuoteTotals", () => {
  const items = [item(250, 900, "a"), item(250, 180, "b"), item(1, 15000, "c")];

  test("aplica desconto e acréscimo", () => {
    const totals = calculateQuoteTotals(items, 15000, 0);

    expect(totals.subtotal).toBe(285000);
    expect(totals.discount).toBe(15000);
    expect(totals.total).toBe(270000);
  });

  test("acréscimo entra antes do desconto no teto", () => {
    const totals = calculateQuoteTotals(items, 0, 10000);
    expect(totals.total).toBe(295000);
  });

  test("desconto maior que o total é limitado — total nunca fica negativo", () => {
    const totals = calculateQuoteTotals(items, 999999, 0);

    expect(totals.discount).toBe(285000);
    expect(totals.total).toBe(0);
  });

  test("valores negativos digitados são tratados como zero", () => {
    const totals = calculateQuoteTotals(items, -500, -800);

    expect(totals.discount).toBe(0);
    expect(totals.surcharge).toBe(0);
    expect(totals.total).toBe(285000);
  });

  test("orçamento sem itens fecha em zero", () => {
    const totals = calculateQuoteTotals([], 5000, 0);

    expect(totals.subtotal).toBe(0);
    expect(totals.total).toBe(0);
  });
});
