import type { ReactNode } from "react";

import {
  formatCurrency,
  formatDocument,
  formatLongDate,
  formatPhone,
  formatQuantity,
  formatZipCode,
  pixKeyKind,
  unitLabel,
} from "@shared/format";
import { calculateItemTotal, calculateQuoteTotals } from "@shared/quote-totals";
import type { Company, Quote } from "@shared/types";

export interface QuoteDocumentProps {
  quote: Quote;
  company: Company;
}

const DASH = "—";

/**
 * O documento A4 que o cliente recebe. É a única tela do app onde a escala de
 * texto é a de papel, não a de monitor — por isso a família `text-doc-*`.
 *
 * Campo vazio imprime "—", nunca em branco: um espaço vazio no papel parece
 * erro de impressão; um travessão parece decisão.
 */
export function QuoteDocument({ quote, company }: QuoteDocumentProps) {
  const totals = calculateQuoteTotals(quote.items, quote.discount, quote.surcharge);
  const customer = quote.customer;

  return (
    <article className="quote-document">
      <div className="quote-document-rule" />

      <div className="quote-document-body">
        <Header quote={quote} company={company} />

        <div className="mt-5 grid grid-cols-3 gap-3">
          <InfoBox label="Emitido em" value={formatLongDate(quote.issuedAt)} />
          <InfoBox label="Válido até" value={formatLongDate(quote.validUntil)} />
          <InfoBox
            label="Forma de pagamento"
            value={company.pixKey.trim() === "" ? "Dinheiro" : "Pix ou dinheiro"}
          />
        </div>

        <SectionLabel>Cliente</SectionLabel>

        <div className="rounded-md border border-line p-4">
          <Field label="Nome / Razão social" value={customer.name} wide />

          <div className="mt-3 grid grid-cols-3 gap-4">
            <Field label="Telefone" value={formatPhone(customer.phone)} />
            <Field label="CPF / CNPJ" value={formatDocument(customer.document)} />
            <Field label="RG / IE" value={customer.stateRegistration} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-4">
            <Field label="Endereço" value={customer.address} />
            <Field label="Bairro" value={customer.district} />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-4">
            <Field label="Cidade" value={customer.city} />
            <Field label="Estado" value={customer.state} />
            <Field label="CEP" value={formatZipCode(customer.zipCode)} />
          </div>
        </div>

        <SectionLabel>Itens do orçamento</SectionLabel>

        <ItemsTable quote={quote} />

        <div className="mt-5 grid grid-cols-2 gap-6">
          <PaymentBox company={company} />
          <TotalsColumn totals={totals} />
        </div>

        {quote.notes.trim() === "" ? null : (
          <div className="mt-5 rounded-md border border-line p-4">
            <p className="text-doc-label font-bold tracking-wide text-content-brand uppercase">
              Observações
            </p>
            <p className="mt-1.5 text-doc whitespace-pre-line">{quote.notes}</p>
          </div>
        )}

        <div className="mt-auto pt-8">
          <div className="grid grid-cols-2 gap-16">
            <Signature name={company.name} role="Responsável" />
            <Signature name={customer.name} role="Cliente" />
          </div>

          <p className="mt-4 text-center text-doc-sm text-content-muted">
            {[
              company.name,
              formatPhone(company.phone),
              addressLine(company),
            ]
              .filter((part) => part !== "")
              .join("  ·  ")}
          </p>
        </div>
      </div>
    </article>
  );
}

function Header({ quote, company }: QuoteDocumentProps) {
  return (
    <header className="flex items-start gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-brand-700">
        {company.logoUri === null ? (
          <span className="text-doc-lg font-bold text-white">
            {initialsOf(company.name)}
          </span>
        ) : (
          <img src={company.logoUri} alt="" className="h-full w-full object-contain" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h1 className="text-doc-title font-bold">
          {company.name.trim() === "" ? "Sua empresa" : company.name}
        </h1>

        {company.document === "" ? null : (
          <p className="text-doc-sm text-content-muted">
            CPF/CNPJ: {formatDocument(company.document)}
          </p>
        )}

        {[
          joinParts([company.address, company.district], " — "),
          joinParts(
            [
              joinParts([company.city, company.state], "/"),
              company.zipCode === "" ? "" : `CEP ${formatZipCode(company.zipCode)}`,
            ],
            " — ",
          ),
          joinParts([formatPhone(company.phone), company.email], "  ·  "),
        ]
          .filter((line) => line !== "")
          .map((line) => (
            <p key={line} className="text-doc-sm text-content-brand">
              {line}
            </p>
          ))}
      </div>

      <div className="shrink-0 rounded-md bg-brand-soft px-5 py-3 text-right">
        <span className="block text-doc-label font-bold tracking-wide text-brand-700 uppercase">
          Orçamento
        </span>
        <span className="block text-doc-total font-bold text-brand-800">
          Nº {quote.number}
        </span>
      </div>
    </header>
  );
}

function ItemsTable({ quote }: { quote: Quote }) {
  return (
    <table className="w-full border-collapse text-doc">
      <thead>
        <tr className="bg-brand-soft text-doc-label font-bold tracking-wide text-brand-800 uppercase">
          <th scope="col" className="w-10 px-3 py-2.5 text-left">
            Item
          </th>
          <th scope="col" className="px-2 py-2.5 text-left">
            Descrição
          </th>
          <th scope="col" className="w-24 px-3 py-2.5 text-right">
            Quant.
          </th>
          <th scope="col" className="w-28 px-3 py-2.5 text-right">
            Valor unit.
          </th>
          <th scope="col" className="w-28 px-3 py-2.5 text-right">
            Total
          </th>
        </tr>
      </thead>

      <tbody>
        {quote.items.map((item, index) => (
          <tr key={item.id} className="border-b border-line">
            <td className="px-3 py-2.5 text-content-muted">{index + 1}</td>
            <td className="px-2 py-2.5">{item.description}</td>
            <td className="px-3 py-2.5 text-right whitespace-nowrap">
              {formatQuantity(item.quantity)} {unitLabel(item.unit)}
            </td>
            <td className="px-3 py-2.5 text-right whitespace-nowrap">
              {formatCurrency(item.unitPrice)}
            </td>
            <td className="px-3 py-2.5 text-right font-bold whitespace-nowrap">
              {formatCurrency(calculateItemTotal(item))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PaymentBox({ company }: { company: Company }) {
  if (company.pixKey.trim() === "") {
    return (
      <div className="rounded-md bg-subtle p-4">
        <p className="text-doc-label font-bold tracking-wide text-content-brand uppercase">
          Pagamento
        </p>
        <p className="mt-1.5 text-doc text-content-muted">
          Combine a forma de pagamento diretamente com a empresa.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md bg-subtle p-4">
      <p className="text-doc-label font-bold tracking-wide text-content-brand uppercase">
        Pagamento
      </p>
      <p className="mt-1.5 text-doc-sm text-content-muted">
        Chave Pix {pixKeyKind(company.pixKey)}
      </p>
      <p className="mt-0.5 text-doc-lg font-bold">{company.pixKey}</p>
      {company.pixHolder === "" ? null : (
        <p className="mt-1 text-doc text-content-muted">{company.pixHolder}</p>
      )}
    </div>
  );
}

function TotalsColumn({
  totals,
}: {
  totals: ReturnType<typeof calculateQuoteTotals>;
}) {
  return (
    <div>
      <TotalRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
      <TotalRow
        label="Desconto"
        value={
          totals.discount === 0
            ? formatCurrency(0)
            : `– ${formatCurrency(totals.discount)}`
        }
      />
      <TotalRow label="Acréscimo" value={formatCurrency(totals.surcharge)} />

      <div className="mt-3 flex items-center justify-between rounded-md bg-brand-700 px-4 py-3 text-white">
        <span className="text-doc-label font-bold tracking-wide uppercase">Total</span>
        <span className="text-doc-total font-bold">{formatCurrency(totals.total)}</span>
      </div>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-line py-2 text-doc">
      <span className="text-content-muted">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-subtle px-4 py-3">
      <p className="text-doc-label font-bold tracking-wide text-content-muted uppercase">
        {label}
      </p>
      <p className="mt-1 text-doc-lg font-semibold">{value}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 mb-2 flex items-center gap-3">
      <span className="text-doc-label font-bold tracking-wide text-content-brand uppercase">
        {children}
      </span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function Field({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div>
      <p className="text-doc-label font-bold tracking-wide text-content-muted uppercase">
        {label}
      </p>
      <p className={wide ? "mt-0.5 text-doc-lg" : "mt-0.5 text-doc"}>
        {value.trim() === "" ? DASH : value}
      </p>
    </div>
  );
}

function Signature({ name, role }: { name: string; role: string }) {
  return (
    <div className="border-t border-line-strong pt-1.5 text-center">
      <p className="text-doc font-bold">{name.trim() === "" ? DASH : name}</p>
      <p className="text-doc-sm text-content-brand">{role}</p>
    </div>
  );
}

function joinParts(parts: readonly string[], separator: string): string {
  return parts.filter((part) => part.trim() !== "").join(separator);
}

function addressLine(company: Company): string {
  return joinParts(
    [company.address, joinParts([company.city, company.state], "/")],
    " — ",
  );
}


function initialsOf(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter((part) => part.length > 2)
    .slice(0, 2);

  if (parts.length === 0) return name.slice(0, 2).toUpperCase() || "OG";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}
