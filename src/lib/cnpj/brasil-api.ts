import { z } from "zod";

import { env } from "@/config/env";
import { onlyDigits } from "@/utils/format";

/**
 * Cliente da consulta pública de CNPJ (BrasilAPI).
 *
 * O schema valida só o que a tela consome. A API devolve dezenas de campos
 * (QSA, CNAEs, regime tributário); aceitar tudo cegamente faria qualquer
 * mudança no contrato virar erro de runtime dentro do formulário.
 */
const companySchema = z.object({
  cnpj: z.string(),
  razao_social: z.string(),
  nome_fantasia: z.string().nullish(),
  ddd_telefone_1: z.string().nullish(),
  logradouro: z.string().nullish(),
  numero: z.string().nullish(),
  complemento: z.string().nullish(),
  bairro: z.string().nullish(),
  municipio: z.string().nullish(),
  uf: z.string().nullish(),
  cep: z.string().nullish(),
  descricao_situacao_cadastral: z.string().nullish(),
});

export interface CompanyLookup {
  document: string;
  name: string;
  tradeName: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  /** `false` quando a empresa está BAIXADA, SUSPENSA, INAPTA etc. */
  isActive: boolean;
  registrationStatus: string;
}

/**
 * Resultado explícito em vez de exceção.
 *
 * Cada variante corresponde a um estado desenhado do campo CNPJ
 * (ver board `Spec / Campo CNPJ — estados e API` no Penpot), então a tela
 * consegue tratar todos os casos sem try/catch espalhado.
 */
export type CnpjLookupResult =
  | { status: "found"; company: CompanyLookup }
  | { status: "not-found" }
  | { status: "invalid" }
  | { status: "error"; reason: "timeout" | "network" | "unexpected-shape" };

export function isValidCnpjFormat(value: string): boolean {
  return onlyDigits(value).length === 14;
}

function buildAddress(
  logradouro: string | null | undefined,
  numero: string | null | undefined,
): string {
  return [logradouro?.trim(), numero?.trim()].filter(Boolean).join(", ");
}

export async function lookupCnpj(rawCnpj: string): Promise<CnpjLookupResult> {
  const digits = onlyDigits(rawCnpj);
  if (digits.length !== 14) return { status: "invalid" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.cnpjTimeoutMs);

  try {
    const response = await fetch(`${env.cnpjApiUrl}/${digits}`, {
      signal: controller.signal,
    });

    if (response.status === 404) return { status: "not-found" };
    if (!response.ok) return { status: "error", reason: "network" };

    const parsed = companySchema.safeParse(await response.json());
    if (!parsed.success) return { status: "error", reason: "unexpected-shape" };

    const data = parsed.data;
    const registrationStatus = data.descricao_situacao_cadastral ?? "";

    return {
      status: "found",
      company: {
        document: data.cnpj,
        name: data.razao_social,
        tradeName: data.nome_fantasia ?? "",
        phone: data.ddd_telefone_1 ?? "",
        address: buildAddress(data.logradouro, data.numero),
        district: data.bairro ?? "",
        city: data.municipio ?? "",
        state: data.uf ?? "",
        zipCode: data.cep ?? "",
        isActive: registrationStatus.toUpperCase() === "ATIVA",
        registrationStatus,
      },
    };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return { status: "error", reason: aborted ? "timeout" : "network" };
  } finally {
    clearTimeout(timeout);
  }
}
