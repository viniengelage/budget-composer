import type { Cents, IsoDate, UnitOfMeasure } from "@shared/types";

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

export function formatCurrency(cents: Cents): string {
  const rounded = Math.round(cents);
  const sign = rounded < 0 ? "-" : "";
  const absolute = Math.abs(rounded);
  const whole = Math.floor(absolute / 100);
  const fraction = absolute % 100;

  return `${sign}R$ ${groupThousands(String(whole))},${String(fraction).padStart(2, "0")}`;
}

export function formatCurrencyValue(cents: Cents): string {
  return formatCurrency(cents).replace("R$ ", "");
}

export function digitsToCents(input: string): Cents {
  const digits = onlyDigits(input).slice(0, 12);
  return digits.length === 0 ? 0 : Number.parseInt(digits, 10);
}

export function parseCurrency(input: string): Cents {
  const cleaned = input.replace(/[^\d,.-]/g, "").trim();
  if (cleaned === "") return 0;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const separatorAt = Math.max(lastComma, lastDot);

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

/**
 * Aceita "250", "12,5" e "12.5". Quantidade pode ser fracionada (meio metro
 * de grama existe), mas nunca negativa.
 */
export function parseQuantity(input: string): number {
  const cleaned = input.replace(/[^\d,.]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 1000) / 1000;
}

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

/**
 * Máscara progressiva: vai montando 00.000.000/0000-00 conforme a pessoa
 * digita, em vez de só formatar quando os 14 dígitos estiverem completos.
 */
export function maskCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);
  if (digits.length === 0) return "";

  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 8),
    digits.slice(8, 12),
    digits.slice(12, 14),
  ];
  const separators = [".", ".", "/", "-"];

  let masked = parts[0] ?? "";
  for (let index = 1; index < parts.length; index += 1) {
    const part = parts[index];
    if (part === undefined || part === "") break;
    masked += separators[index - 1] + part;
  }

  return masked;
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

export function formatDate(iso: IsoDate): string {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

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
