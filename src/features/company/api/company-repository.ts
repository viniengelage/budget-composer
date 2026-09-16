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

/**
 * Dados de desenvolvimento, vindos de `.env.local` (fora do git).
 *
 * Enquanto a tela de Configurações é placeholder, não há como cadastrar a
 * empresa pela interface — e sem empresa o cabeçalho do PDF fica vazio.
 * Isto preenche esse buraco SEM colocar dado pessoal no repositório.
 *
 * Ver `.env.local.example`. Some do bundle de produção por dead code
 * elimination, já que `__DEV__` é constante no build de release.
 */
function devSeed(): Partial<Company> {
  if (!__DEV__) return {};

  const raw = process.env.EXPO_PUBLIC_DEV_COMPANY;
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Partial<Company>;
  } catch {
    console.warn("[company] EXPO_PUBLIC_DEV_COMPANY não é JSON válido — ignorando.");
    return {};
  }
}

export const companyRepository = {
  async get(): Promise<Company> {
    const stored = await storage.get<Partial<Company>>(KEY);

    // Ordem importa: o que a usuária salvou sempre vence a semente de dev.
    // Merge com o padrão para que um campo novo numa versão futura não
    // deixe a tela com `undefined` para quem já tem dados gravados.
    return { ...DEFAULT_COMPANY, ...devSeed(), ...stored };
  },

  async save(company: Company): Promise<Company> {
    await storage.set(KEY, company);
    return company;
  },
};
