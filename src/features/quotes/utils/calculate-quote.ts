import type { Cents, QuoteItem } from "@/types";

export interface QuoteTotals {
  /** Soma dos itens, antes de desconto e acréscimo. */
  subtotal: Cents;
  discount: Cents;
  surcharge: Cents;
  total: Cents;
}

/**
 * Total de um item: quantidade × preço unitário.
 *
 * A quantidade pode ser fracionada (ex.: 12,5 m²), então o produto é
 * arredondado para o centavo mais próximo AQUI, item a item. Arredondar
 * só no final faria a soma exibida divergir da soma das linhas impressas
 * no PDF — e o cliente confere linha por linha.
 */
export function calculateItemTotal(
  item: Pick<QuoteItem, "quantity" | "unitPrice">,
): Cents {
  return Math.round(item.quantity * item.unitPrice);
}

export function calculateSubtotal(items: readonly QuoteItem[]): Cents {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
}

/**
 * Totais do orçamento.
 *
 * O desconto é limitado ao subtotal + acréscimo: um orçamento com total
 * negativo não existe no mundo real e não deve existir no PDF.
 */
export function calculateQuoteTotals(
  items: readonly QuoteItem[],
  discount: Cents,
  surcharge: Cents,
): QuoteTotals {
  const subtotal = calculateSubtotal(items);
  const safeSurcharge = Math.max(0, Math.round(surcharge));
  const ceiling = subtotal + safeSurcharge;
  const safeDiscount = Math.min(Math.max(0, Math.round(discount)), ceiling);

  return {
    subtotal,
    discount: safeDiscount,
    surcharge: safeSurcharge,
    total: ceiling - safeDiscount,
  };
}
