import { storage } from "@/lib/storage/storage";
import type { Company } from "@/types";

const KEY = "company";

/**
 * Estado inicial da empresa — vazio de propósito.
 *
 * Nenhum dado pessoal real mora no código: CPF, telefone e e-mail são
 * informação do usuário, não constante de aplicação. Eles entram pela tela
 * de Configurações e ficam no banco local da máquina dele.
 *
 * O checklist de primeiro uso (board 06 do Penpot) já trata "preencher os
 * dados da empresa" como o passo 1, então começar vazio é o fluxo correto.
 */
export const DEFAULT_COMPANY: Company = {
  name: "",
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
  defaultValidityDays: 30,
};

/** A empresa está configurada o bastante para emitir um orçamento? */
export function isCompanyConfigured(company: Company): boolean {
  return company.name.trim() !== "" && company.phone.trim() !== "";
}

export const companyRepository = {
  async get(): Promise<Company> {
    const stored = await storage.get<Partial<Company>>(KEY);
    // Merge com o padrão: um campo novo numa versão futura não deixa
    // a tela com `undefined` para quem já tem dados salvos.
    return { ...DEFAULT_COMPANY, ...stored };
  },

  async save(company: Company): Promise<Company> {
    await storage.set(KEY, company);
    return company;
  },
};
