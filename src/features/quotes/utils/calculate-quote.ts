import type { Cents, QuoteItem } from "@/types";

export interface QuoteTotals {
  subtotal: Cents;
  discount: Cents;
  surcharge: Cents;
  total: Cents;
}

export function calculateItemTotal(
  item: Pick<QuoteItem, "quantity" | "unitPrice">,
): Cents {
  return Math.round(item.quantity * item.unitPrice);
}

export function calculateSubtotal(items: readonly QuoteItem[]): Cents {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
}

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
