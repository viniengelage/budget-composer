import { describe, expect, test } from "bun:test";

import { validateCompany } from "@/features/company/types/company-schema";
import type { Company } from "@shared/types";

function company(overrides: Partial<Company> = {}): Company {
  return {
    name: "Minha Empresa",
    document: "",
    phone: "",
    email: "",
    address: "",
    district: "",
    city: "",
    state: "",
    zipCode: "",
    pixKey: "",
    pixHolder: "",
    logoUri: null,
    defaultValidityDays: 15,
    ...overrides,
  };
}

describe("dados da empresa", () => {
  test("só o nome é obrigatório", () => {
    expect(validateCompany(company())).toBeNull();
  });

  test("sem nome, explica por que ele importa", () => {
    expect(validateCompany(company({ name: "  " }))?.["name"]).toBe(
      "Escreva o nome da empresa. Ele sai no alto de todo orçamento.",
    );
  });

  test("validade zerada é barrada", () => {
    expect(validateCompany(company({ defaultValidityDays: 0 }))?.[
      "defaultValidityDays"
    ]).toBe("A validade precisa ser de pelo menos 1 dia.");
  });

  test("validade absurda é barrada", () => {
    expect(
      validateCompany(company({ defaultValidityDays: 400 }))?.["defaultValidityDays"],
    ).toBe("A validade não pode passar de 365 dias.");
  });

  test("logo pode ser nula", () => {
    expect(validateCompany(company({ logoUri: null }))).toBeNull();
  });

  test("nenhuma mensagem vaza jargão de programador", () => {
    const jargon = /required|invalid|string|number|expected|type/i;
    const errors = validateCompany(company({ name: "", defaultValidityDays: 0 }));

    for (const message of Object.values(errors ?? {})) {
      expect(message).not.toMatch(jargon);
    }
  });
});
