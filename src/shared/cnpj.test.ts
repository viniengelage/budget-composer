import { describe, expect, test } from "bun:test";

import { cnpjDigits, isValidCnpjFormat } from "@shared/cnpj";
import { maskCnpj } from "@shared/format";

describe("CNPJ digitado ou colado", () => {
  test("colar com pontuação chega a 14 dígitos", () => {
    expect(cnpjDigits("10.685.570/0004-69")).toBe("10685570000469");
    expect(isValidCnpjFormat("10.685.570/0004-69")).toBe(true);
  });

  test("colar e remascarar devolve o mesmo texto", () => {
    const pasted = "10.685.570/0004-69";
    expect(maskCnpj(cnpjDigits(pasted))).toBe(pasted);
  });

  test("colar com texto em volta aproveita só os dígitos", () => {
    expect(cnpjDigits("CNPJ: 10.685.570/0004-69")).toBe("10685570000469");
  });

  test("corta no 14º dígito — sobra escondida travaria a busca", () => {
    expect(cnpjDigits("106855700004691234")).toBe("10685570000469");
    expect(isValidCnpjFormat("106855700004691234")).toBe(true);
  });

  test("espaço, tab e quebra de linha do copiar não contam", () => {
    expect(cnpjDigits(" 10.685.570 / 0004-69 \n")).toBe("10685570000469");
  });

  test("incompleto não é válido", () => {
    expect(isValidCnpjFormat("10.685.570")).toBe(false);
    expect(isValidCnpjFormat("")).toBe(false);
  });
});
