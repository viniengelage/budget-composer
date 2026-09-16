import { z } from "zod";

import { env } from "@main/config/env";
import type { CnpjLookupResult } from "@shared/cnpj";
import { onlyDigits } from "@shared/format";

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
