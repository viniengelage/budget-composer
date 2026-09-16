import { useState } from "react";

import { Card, Icon, MoneyField, TextField } from "@/components/ui";
import { UNIT_OPTIONS } from "@/config/units";
import type {
  QuoteDraftErrors,
  QuoteDraftItem,
} from "@/features/quotes/types/quote-schema";
import { formatCurrency, formatQuantity, parseQuantity, unitLabel } from "@shared/format";
import { calculateItemTotal } from "@shared/quote-totals";
import type { UnitOfMeasure } from "@shared/types";

export interface ItemsCardProps {
  items: QuoteDraftItem[];
  errors: QuoteDraftErrors;
  onUpdate: (key: string, patch: Partial<Omit<QuoteDraftItem, "key">>) => void;
  onRemove: (key: string) => void;
  onAdd: () => void;
}

export function ItemsCard({ items, errors, onUpdate, onRemove, onAdd }: ItemsCardProps) {
  return (
    <Card title="Itens do orçamento" step={2}>
      {items.length > 0 ? (
        <div className="flex flex-col">
          <div className="flex items-end gap-4 border-b border-line pb-3 text-xs font-semibold tracking-wide text-content-muted uppercase">
            <span className="flex-1">Produto</span>
            <span className="w-28">Quant.</span>
            <span className="w-36">Valor unit.</span>
            <span className="w-32 text-right">Total</span>
            <span className="w-24" />
          </div>

          {items.map((item, index) => (
            <ItemRow
              key={item.key}
              item={item}
              index={index}
              errors={errors}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      ) : null}

      {errors["items"] ? (
        <p className="rounded-md bg-danger-50 px-4 py-3 text-sm text-content-danger">
          {errors["items"]}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onAdd}
        className="flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-md border-2 border-dashed border-brand-300 bg-brand-soft font-semibold text-content-brand transition-colors hover:border-brand-500 hover:bg-brand-100"
      >
        <Icon name="plus" size={22} />
        Adicionar produto
      </button>
    </Card>
  );
}

function ItemRow({
  item,
  index,
  errors,
  onUpdate,
  onRemove,
}: {
  item: QuoteDraftItem;
  index: number;
  errors: QuoteDraftErrors;
  onUpdate: ItemsCardProps["onUpdate"];
  onRemove: ItemsCardProps["onRemove"];
}) {
  const descriptionError = errors[`items.${index}.description`];
  const quantityError = errors[`items.${index}.quantity`];
  const priceError = errors[`items.${index}.unitPrice`];

  return (
    <div className="flex items-start gap-4 border-b border-line py-4 last:border-b-0">
      <div className="flex-1 pt-2.5">
        {item.productId === null ? (
          <TextField
            label={`Item ${index + 1}`}
            hideLabel
            placeholder="Escreva o que é este item"
            value={item.description}
            onChange={(event) => onUpdate(item.key, { description: event.target.value })}
            tone={descriptionError ? "error" : "default"}
            hint={descriptionError}
          />
        ) : (
          <>
            <span className="block font-semibold">{item.description}</span>
            {descriptionError ? (
              <span className="block text-xs text-content-danger">
                {descriptionError}
              </span>
            ) : null}
          </>
        )}
      </div>

      <div className="w-28">
        <QuantityField
          label={`Quantidade do item ${index + 1}`}
          initial={item.quantity}
          unit={item.unit}
          error={quantityError}
          onChange={(quantity) => onUpdate(item.key, { quantity })}
        />
      </div>

      <div className="w-36">
        <MoneyField
          label={`Valor unitário do item ${index + 1}`}
          hideLabel
          value={item.unitPrice}
          onChange={(unitPrice) => onUpdate(item.key, { unitPrice })}
          tone={priceError ? "error" : "default"}
          hint={priceError}
        />
      </div>

      <div className="w-32 pt-4 text-right font-bold tabular-nums">
        {formatCurrency(calculateItemTotal(item))}
      </div>

      <div className="w-24 pt-4">
        {item.productId === null ? (
          <UnitPicker
            unit={item.unit}
            onChange={(unit) => onUpdate(item.key, { unit })}
            index={index}
          />
        ) : null}
        <button
          type="button"
          onClick={() => onRemove(item.key)}
          className="cursor-pointer rounded-sm font-semibold text-content-danger hover:underline"
          aria-label={`Remover ${item.description || `item ${index + 1}`}`}
        >
          Remover
        </button>
      </div>
    </div>
  );
}

/**
 * Guarda o texto digitado, não o número. Reformatar a cada tecla apagaria a
 * vírgula no instante em que ela é digitada — "12," viraria "12" e ninguém
 * conseguiria escrever 12,5. Como a quantidade só muda por aqui, o estado
 * local basta; o `key` da linha cuida da troca de item.
 */
function QuantityField({
  label,
  initial,
  unit,
  error,
  onChange,
}: {
  label: string;
  initial: number;
  unit: UnitOfMeasure;
  error: string | undefined;
  onChange: (quantity: number) => void;
}) {
  const [text, setText] = useState(() => formatQuantity(initial));

  return (
    <TextField
      label={label}
      hideLabel
      inputMode="decimal"
      suffix={unitLabel(unit)}
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        onChange(parseQuantity(event.target.value));
      }}
      onBlur={(event) => setText(formatQuantity(parseQuantity(event.target.value)))}
      tone={error ? "error" : "default"}
      hint={error}
    />
  );
}

function UnitPicker({
  unit,
  onChange,
  index,
}: {
  unit: UnitOfMeasure;
  onChange: (unit: UnitOfMeasure) => void;
  index: number;
}) {
  return (
    <select
      aria-label={`Unidade de medida do item ${index + 1}`}
      value={unit}
      onChange={(event) => onChange(event.target.value as UnitOfMeasure)}
      className="mb-2 w-full cursor-pointer rounded-sm border border-line bg-surface px-1.5 py-1 text-xs"
    >
      {UNIT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
