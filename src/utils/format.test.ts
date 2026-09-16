import { describe, expect, test } from "bun:test";

import {
  addDays,
  digitsToCents,
  formatCurrency,
  formatDate,
  formatDocument,
  formatLongDate,
  formatPhone,
  formatQuantity,
  parseCurrency,
} from "@/utils/format";

describe("formatCurrency", () => {
  test("formata centavos em reais no padrão pt-BR", () => {
    expect(formatCurrency(0)).toBe("R$ 0,00");
    expect(formatCurrency(5)).toBe("R$ 0,05");
    expect(formatCurrency(150)).toBe("R$ 1,50");
    expect(formatCurrency(270000)).toBe("R$ 2.700,00");
    expect(formatCurrency(1230000)).toBe("R$ 12.300,00");
    expect(formatCurrency(123456789)).toBe("R$ 1.234.567,89");
  });

  test("preserva o sinal negativo", () => {
    expect(formatCurrency(-15000)).toBe("-R$ 150,00");
  });
});

describe("digitsToCents", () => {
  test("trata cada tecla digitada como centavo", () => {
    expect(digitsToCents("")).toBe(0);
    expect(digitsToCents("9")).toBe(9);
    expect(digitsToCents("900")).toBe(900);
    expect(digitsToCents("270000")).toBe(270000);
  });

  test("ignora qualquer caractere que não seja dígito", () => {
    expect(digitsToCents("R$ 2.700,00")).toBe(270000);
    expect(digitsToCents("abc")).toBe(0);
  });
});

describe("parseCurrency", () => {
  test("lê valores já escritos em pt-BR", () => {
    expect(parseCurrency("2.700,00")).toBe(270000);
    expect(parseCurrency("R$ 1.480,50")).toBe(148050);
    expect(parseCurrency("9,00")).toBe(900);
  });

  test("lê valores escritos com ponto decimal", () => {
    expect(parseCurrency("2700.50")).toBe(270050);
  });

  test("trata inteiro sem separador como reais cheios", () => {
    expect(parseCurrency("2700")).toBe(270000);
  });

  test("não quebra com entrada vazia ou inválida", () => {
    expect(parseCurrency("")).toBe(0);
    expect(parseCurrency("abc")).toBe(0);
  });
});

describe("formatQuantity", () => {
  test("mantém inteiro sem casas decimais", () => {
    expect(formatQuantity(250)).toBe("250");
  });

  test("usa vírgula como separador decimal", () => {
    expect(formatQuantity(12.5)).toBe("12,5");
  });
});

describe("formatDocument", () => {
  test("aplica máscara de CPF", () => {
    expect(formatDocument("12345678909")).toBe("123.456.789-09");
  });

  test("aplica máscara de CNPJ", () => {
    expect(formatDocument("12345678000190")).toBe("12.345.678/0001-90");
  });

  test("devolve o valor original quando o tamanho não bate", () => {
    expect(formatDocument("123")).toBe("123");
  });
});

describe("formatPhone", () => {
  test("formata celular e fixo", () => {
    expect(formatPhone("45900000000")).toBe("(45) 90000-0000");
    expect(formatPhone("4530000000")).toBe("(45) 3000-0000");
  });
});

describe("datas", () => {
  test("formata sem deslocar o dia por fuso horário", () => {
    expect(formatDate("2026-08-01")).toBe("01/08/2026");
    expect(formatDate("2026-01-01")).toBe("01/01/2026");
  });

  test("formata data por extenso", () => {
    expect(formatLongDate("2026-08-01")).toBe("01 de agosto de 2026");
    expect(formatLongDate("2026-12-25")).toBe("25 de dezembro de 2026");
  });

  test("soma dias atravessando virada de mês e de ano", () => {
    expect(addDays("2026-08-01", 30)).toBe("2026-08-31");
    expect(addDays("2026-08-15", 30)).toBe("2026-09-14");
    expect(addDays("2026-12-20", 30)).toBe("2027-01-19");
  });

  test("soma dias em ano bissexto", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });
});
