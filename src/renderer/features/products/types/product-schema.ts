import { z } from "zod";

import { UNITS } from "@shared/types";

/**
 * As mensagens são a interface, não um detalhe: cada uma diz o que fazer, em
 * português, sem nomear o campo em inglês nem falar em "validação".
 */
export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Escreva o nome do produto.")
    .max(80, "O nome ficou comprido demais. Tente resumir."),

  unit: z.enum(UNITS, { error: "Escolha uma unidade de medida da lista." }),

  unitPrice: z
    .number()
    .int()
    .min(1, "Digite quanto custa. O preço não pode ficar em zero."),

  description: z
    .string()
    .trim()
    .max(120, "A descrição ficou comprida demais para caber na linha do orçamento."),
});

export type ProductFormValues = z.output<typeof productFormSchema>;
