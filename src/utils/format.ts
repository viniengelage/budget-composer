import type { Cents, IsoDate, UnitOfMeasure } from "@/types";

/**
 * Formatação pt-BR feita à mão, de propósito.
 *
 * `Intl` varia entre os motores JS de cada plataforma (Hermes no Windows,
 * JSC no macOS) e pode vir sem os dados de locale. Como o app tem UM idioma
 * só, formatar na mão é mais previsível, testável e não depende do runtime.
 */

const MONTHS_PT = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function groupThousands(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** 270000 -> "R$ 2.700,00" */
export function formatCurrency(cents: Cents): string {
  const rounded = Math.round(cents);
  const sign = rounded < 0 ? "-" : "";
  const absolute = Math.abs(rounded);
  const whole = Math.floor(absolute / 100);
  const fraction = absolute % 100;

  return `${sign}R$ ${groupThousands(String(whole))},${String(fraction).padStart(2, "0")}`;
}

/** 270000 -> "2.700,00" (sem símbolo, para campos de input) */
export function formatCurrencyValue(cents: Cents): string {
  return formatCurrency(cents).replace("R$ ", "");
}

/**
 * Converte a digitação crua em centavos, tratando cada tecla como centavo.
 * Digitar "27050" vira R$ 270,50 — sem vírgula, sem ponto, sem erro.
 * É o padrão de campo monetário mais seguro para quem não domina teclado.
 */
export function digitsToCents(input: string): Cents {
  const digits = onlyDigits(input).slice(0, 12);
  return digits.length === 0 ? 0 : Number.parseInt(digits, 10);
}

/**
 * Leitura tolerante de valores já escritos ("2.700,50", "2700.50", "2700").
 * Use em importação de dados, não no campo de digitação.
 */
export function parseCurrency(input: string): Cents {
  const cleaned = input.replace(/[^\d,.-]/g, "").trim();
  if (cleaned === "") return 0;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const separatorAt = Math.max(lastComma, lastDot);

  // Sem separador decimal plausível => valor inteiro em reais.
  if (separatorAt === -1 || cleaned.length - separatorAt - 1 > 2) {
    return Math.round(Number.parseInt(onlyDigits(cleaned), 10) || 0) * 100;
  }

  const whole = onlyDigits(cleaned.slice(0, separatorAt));
  const fraction = onlyDigits(cleaned.slice(separatorAt + 1))
    .padEnd(2, "0")
    .slice(0, 2);
  const sign = cleaned.startsWith("-") ? -1 : 1;

  return (
    sign *
    ((Number.parseInt(whole, 10) || 0) * 100 + (Number.parseInt(fraction, 10) || 0))
  );
}

/** 250 -> "250"; 12.5 -> "12,5" */
export function formatQuantity(quantity: number): string {
  if (Number.isInteger(quantity)) return String(quantity);
  return String(Number(quantity.toFixed(3))).replace(".", ",");
}

const UNIT_LABELS: Record<UnitOfMeasure, string> = {
  m2: "m²",
  m: "m",
  un: "un",
  saco: "saco",
  servico: "serviço",
  hora: "h",
};

export function unitLabel(unit: UnitOfMeasure): string {
  return UNIT_LABELS[unit];
}

/** CPF (11 dígitos) ou CNPJ (14). Fora disso, devolve o que veio. */
export function formatDocument(value: string): string {
  const digits = onlyDigits(value);

  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return value;
}

export function formatPhone(value: string): string {
  const digits = onlyDigits(value);

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return value;
}

export function formatZipCode(value: string): string {
  const digits = onlyDigits(value);
  return digits.length === 8 ? digits.replace(/(\d{5})(\d{3})/, "$1-$2") : value;
}

/**
 * "2026-08-01" -> "01/08/2026".
 *
 * Feito por split, NÃO por `new Date(iso)`: o construtor interpreta a string
 * como UTC e, em fuso negativo como o do Brasil, devolve o dia anterior.
 */
export function formatDate(iso: IsoDate): string {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

/** "2026-08-01" -> "01 de agosto de 2026" */
export function formatLongDate(iso: IsoDate): string {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;

  const monthName = MONTHS_PT[Number.parseInt(month, 10) - 1];
  if (!monthName) return iso;

  return `${day} de ${monthName} de ${year}`;
}

export function toIsoDate(date: Date): IsoDate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  const [year, month, day] = iso.split("-").map((part) => Number.parseInt(part, 10));
  if (year === undefined || month === undefined || day === undefined) return iso;

  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}
