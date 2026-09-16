import { formatDocument, formatPhone } from "@shared/format";
import type { Company } from "@shared/types";

/**
 * Miniatura do cabeçalho que sai impresso. Existe para a pessoa conferir o
 * resultado aqui, em vez de salvar, gerar um PDF e descobrir que o nome ficou
 * errado.
 */
export function PdfHeaderPreview({ company }: { company: Company }) {
  const name = company.name.trim() === "" ? "Nome da sua empresa" : company.name;
  const cityLine = [company.city, company.state].filter((part) => part !== "").join("/");

  return (
    <div className="flex items-start gap-3 rounded-md border border-line bg-surface p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-brand-700">
        {company.logoUri === null ? (
          <span className="text-xs font-bold text-white">{initialsOf(name)}</span>
        ) : (
          <img
            src={company.logoUri}
            alt=""
            className="h-full w-full object-contain"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-content">{name}</p>
        {company.document === "" ? null : (
          <p className="truncate text-[10px] text-content-brand">
            CPF/CNPJ: {formatDocument(company.document)}
          </p>
        )}
        {company.address === "" ? null : (
          <p className="truncate text-[10px] text-content-brand">{company.address}</p>
        )}
        {cityLine === "" ? null : (
          <p className="truncate text-[10px] text-content-brand">{cityLine}</p>
        )}
        {company.phone === "" ? null : (
          <p className="truncate text-[10px] text-content-brand">
            {formatPhone(company.phone)}
          </p>
        )}
      </div>

      <div className="shrink-0 rounded-sm bg-brand-soft px-2 py-1 text-right">
        <span className="block text-[8px] font-bold tracking-wide text-brand-700 uppercase">
          Orçamento
        </span>
        <span className="block text-xs font-bold text-brand-800">Nº 253</span>
      </div>
    </div>
  );
}

function initialsOf(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter((part) => part.length > 2)
    .slice(0, 2);

  if (parts.length === 0) return name.slice(0, 2).toUpperCase();
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}
