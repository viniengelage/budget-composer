import { z } from "zod";

export const companyFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Escreva o nome da empresa. Ele sai no alto de todo orçamento."),
  document: z.string().trim(),
  phone: z.string().trim(),
  email: z.string().trim(),
  address: z.string().trim(),
  district: z.string().trim(),
  city: z.string().trim(),
  state: z.string().trim(),
  zipCode: z.string().trim(),
  pixKey: z.string().trim(),
  pixHolder: z.string().trim(),
  logoUri: z.string().nullable(),
  defaultValidityDays: z
    .number()
    .int()
    .min(1, "A validade precisa ser de pelo menos 1 dia.")
    .max(365, "A validade não pode passar de 365 dias."),
});

export type CompanyFormErrors = Partial<Record<string, string>>;

export function validateCompany(
  company: z.input<typeof companyFormSchema>,
): CompanyFormErrors | null {
  const result = companyFormSchema.safeParse(company);
  if (result.success) return null;

  const errors: CompanyFormErrors = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (errors[path] === undefined) errors[path] = issue.message;
  }
  return errors;
}
