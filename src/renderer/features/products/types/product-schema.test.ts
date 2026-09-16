import { describe, expect, test } from "bun:test";

import { productFormSchema } from "@/features/products/types/product-schema";

const VALID = {
  name: "Grama esmeralda",
  unit: "m2" as const,
  unitPrice: 1250,
  description: "Entregue e espalhada",
};

function messageFor(input: Record<string, unknown>, field: string): string {
  const result = productFormSchema.safeParse(input);
  if (result.success) throw new Error("Esperava erro, mas passou");

  const issue = result.error.issues.find((candidate) => candidate.path[0] === field);
  if (!issue) throw new Error(`Nenhum erro no campo ${field}`);
  return issue.message;
}

describe("cadastro de produto", () => {
  test("aceita um produto completo", () => {
    expect(productFormSchema.safeParse(VALID).success).toBe(true);
  });

  test("descrição é opcional", () => {
    expect(productFormSchema.safeParse({ ...VALID, description: "" }).success).toBe(true);
  });

  test("tira espaço sobrando do nome", () => {
    const result = productFormSchema.parse({ ...VALID, name: "  Adubo  " });
    expect(result.name).toBe("Adubo");
  });

  test("nome vazio explica o que fazer, em português", () => {
    expect(messageFor({ ...VALID, name: "   " }, "name")).toBe(
      "Escreva o nome do produto.",
    );
  });

  test("preço zerado explica o que fazer, em português", () => {
    expect(messageFor({ ...VALID, unitPrice: 0 }, "unitPrice")).toBe(
      "Digite quanto custa. O preço não pode ficar em zero.",
    );
  });

  test("nenhuma mensagem vaza jargão de programador", () => {
    const jargon = /required|invalid|string|number|expected|type/i;
    const broken = productFormSchema.safeParse({
      name: "",
      unit: "xpto",
      unitPrice: 0,
      description: "x".repeat(200),
    });

    if (broken.success) throw new Error("Esperava erros");
    for (const issue of broken.error.issues) {
      expect(issue.message).not.toMatch(jargon);
    }
  });

  test("recusa unidade que o app não sabe imprimir", () => {
    expect(productFormSchema.safeParse({ ...VALID, unit: "tonelada" }).success).toBe(
      false,
    );
  });
});
