import { z } from "zod";

import { env } from "@main/config/env";
import { fetchJson } from "@main/services/http/fetch-json";
import { cnpjDigits, type CnpjLookupResult } from "@shared/cnpj";

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

function buildAddress(
  logradouro: string | null | undefined,
  numero: string | null | undefined,
): string {
  return [logradouro?.trim(), numero?.trim()].filter(Boolean).join(", ");
}

export async function lookupCnpj(rawCnpj: string): Promise<CnpjLookupResult> {
  const digits = cnpjDigits(rawCnpj);
  if (digits.length !== 14) return { status: "invalid" };

  const response = await fetchJson(`${env.cnpjApiUrl}/${digits}`, env.cnpjTimeoutMs);

  if (response.outcome === "timeout") return { status: "error", reason: "timeout" };
  if (response.outcome === "network") return { status: "error", reason: "network" };

  if (response.status === 404) return { status: "not-found" };
  if (response.status < 200 || response.status >= 300) {
    return { status: "error", reason: "network" };
  }

  const parsed = companySchema.safeParse(response.body);
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
}
