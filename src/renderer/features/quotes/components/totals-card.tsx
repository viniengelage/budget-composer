import { Card, MoneyField } from "@/components/ui";
import { formatCurrency } from "@shared/format";
import type { QuoteTotals } from "@shared/quote-totals";
import type { Cents } from "@shared/types";

export interface TotalsCardProps {
  totals: QuoteTotals;
  onDiscountChange: (cents: Cents) => void;
  onSurchargeChange: (cents: Cents) => void;
}

export function TotalsCard({
  totals,
  onDiscountChange,
  onSurchargeChange,
}: TotalsCardProps) {
  return (
    <Card title="Valores" step={3}>
      <div className="flex items-baseline justify-between">
        <span className="text-content-muted">Soma dos itens</span>
        <span className="text-lg font-bold tabular-nums">
          {formatCurrency(totals.subtotal)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MoneyField
          label="Desconto"
          value={totals.discount}
          onChange={onDiscountChange}
        />
        <MoneyField
          label="Acréscimo"
          value={totals.surcharge}
          onChange={onSurchargeChange}
        />
      </div>

      <div className="flex items-center justify-between rounded-md bg-brand-700 px-5 py-4 text-white">
        <span className="text-sm font-bold tracking-wide uppercase">Total</span>
        <span className="text-2xl font-bold tabular-nums">
          {formatCurrency(totals.total)}
        </span>
      </div>
    </Card>
  );
}
