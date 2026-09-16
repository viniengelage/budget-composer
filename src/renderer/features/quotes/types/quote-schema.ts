import { z } from "zod";

import { UNITS } from "@shared/types";

const itemSchema = z.object({
  key: z.string(),
  productId: z.string().nullable(),
  description: z
    .string()
    .trim()
    .min(1, "Escreva o que é este item."),
  unit: z.enum(UNITS, { error: "Escolha uma unidade de medida da lista." }),
  quantity: z.number().gt(0, "Digite a quantidade deste item."),
  unitPrice: z.number().int().min(1, "Digite o valor deste item."),
});

export const quoteDraftSchema = z.object({
  customer: z.object({
    id: z.string().nullable(),
    name: z.string().trim().min(1, "Escreva o nome do cliente."),
    document: z.string().trim(),
    phone: z.string().trim(),
    email: z.string().trim(),
    address: z.string().trim(),
    district: z.string().trim(),
    city: z.string().trim(),
    state: z.string().trim(),
    zipCode: z.string().trim(),
    stateRegistration: z.string().trim(),
  }),
  items: z.array(itemSchema).min(1, "Adicione pelo menos um item ao orçamento."),
  discount: z.number().int().min(0),
  surcharge: z.number().int().min(0),
  notes: z.string(),
});

export type QuoteDraft = z.output<typeof quoteDraftSchema>;
export type QuoteDraftItem = QuoteDraft["items"][number];
export type QuoteDraftCustomer = QuoteDraft["customer"];

/**
 * Erros indexados pelo caminho que a tela usa para mostrá-los:
 * "customer.name", "items", "items.0.quantity".
 */
export type QuoteDraftErrors = Record<string, string>;

export function validateQuoteDraft(draft: QuoteDraft): QuoteDraftErrors | null {
  const result = quoteDraftSchema.safeParse(draft);
  if (result.success) return null;

  const errors: QuoteDraftErrors = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (errors[path] === undefined) errors[path] = issue.message;
  }
  return errors;
}
