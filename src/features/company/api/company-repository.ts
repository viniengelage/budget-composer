import { storage } from "@/lib/storage/storage";
import type { Company } from "@/types";

const KEY = "company";

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

export function isCompanyConfigured(company: Company): boolean {
  return company.name.trim() !== "" && company.phone.trim() !== "";
}

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

    return { ...DEFAULT_COMPANY, ...devSeed(), ...stored };
  },

  async save(company: Company): Promise<Company> {
    await storage.set(KEY, company);
    return company;
  },
};
