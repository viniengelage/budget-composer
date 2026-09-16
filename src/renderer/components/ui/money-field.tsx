import { TextField, type TextFieldProps } from "@/components/ui/text-field";
import { digitsToCents, formatCurrencyValue } from "@shared/format";
import type { Cents } from "@shared/types";

export interface MoneyFieldProps
  extends Omit<TextFieldProps, "value" | "onChange" | "prefix" | "inputMode"> {
  value: Cents;
  onChange: (cents: Cents) => void;
}

/**
 * Dinheiro entra dígito a dígito, da direita para a esquerda: digitar "1250"
 * vira 12,50. Sem ponto, sem vírgula, sem jeito de errar a casa decimal — e o
 * valor nunca vira float no caminho.
 */
export function MoneyField({ value, onChange, ...rest }: MoneyFieldProps) {
  return (
    <TextField
      inputMode="numeric"
      prefix="R$"
      value={formatCurrencyValue(value)}
      onChange={(event) => onChange(digitsToCents(event.target.value))}
      {...rest}
    />
  );
}
