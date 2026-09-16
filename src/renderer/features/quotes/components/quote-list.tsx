import { Button, EmptyState, Icon, Spinner, StatusBadge } from "@/components/ui";
import { formatCurrency, formatDate } from "@shared/format";
import type { QuoteSummary } from "@shared/rpc-contract";

export interface QuoteListProps {
  quotes: QuoteSummary[];
  isLoading: boolean;
  searchTerm: string;
  onOpen: (quote: QuoteSummary) => void;
  onExportPdf: (quote: QuoteSummary) => void;
  onCreate: () => void;
  onClearSearch: () => void;
}

export function QuoteList({
  quotes,
  isLoading,
  searchTerm,
  onOpen,
  onExportPdf,
  onCreate,
  onClearSearch,
}: QuoteListProps) {
  if (isLoading) {
    return (
      <Panel>
        <div className="flex items-center justify-center gap-3 p-16 text-content-muted">
          <Spinner size={28} />
          Carregando seus orçamentos…
        </div>
      </Panel>
    );
  }

  if (quotes.length === 0 && searchTerm !== "") {
    return (
      <Panel>
        <EmptyState
          icon="magnifying-glass"
          tone="neutral"
          title="Nenhum orçamento encontrado"
          description={`Não achei nada com "${searchTerm}". Confira se escreveu certo, ou volte para a lista completa.`}
        >
          <Button label="Mostrar todos" variant="secondary" size="lg" onClick={onClearSearch} />
        </EmptyState>
      </Panel>
    );
  }

  if (quotes.length === 0) {
    return (
      <Panel>
        <EmptyState
          icon="file-text"
          title="Você ainda não fez nenhum orçamento"
          description="Aqui vão aparecer todos os orçamentos que você criar, do mais novo para o mais antigo. Para começar, clique no botão verde."
        >
          <Button
            label="Criar o primeiro orçamento"
            icon="plus"
            size="lg"
            onClick={onCreate}
          />
        </EmptyState>
      </Panel>
    );
  }

  return (
    <Panel>
      <ul className="divide-y divide-line">
        {quotes.map((quote) => (
          <li key={quote.id}>
            <QuoteRow
              quote={quote}
              onOpen={() => onOpen(quote)}
              onExportPdf={() => onExportPdf(quote)}
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function QuoteRow({
  quote,
  onOpen,
  onExportPdf,
}: {
  quote: QuoteSummary;
  onOpen: () => void;
  onExportPdf: () => void;
}) {
  return (
    <div className="flex items-center gap-5 px-6 py-5">
      <div className="w-20 shrink-0">
        <span className="block text-xs text-content-muted">Número</span>
        <span className="block text-lg font-bold tabular-nums">{quote.number}</span>
      </div>

      <div className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold">
          {quote.customerName}
        </span>
        <span className="block truncate text-sm text-content-muted">
          {quote.customerCity === "" ? "Sem cidade informada" : quote.customerCity} ·{" "}
          {quote.itemCount === 1 ? "1 item" : `${quote.itemCount} itens`}
        </span>
      </div>

      <div className="w-36 shrink-0">
        <span className="block text-xs text-content-muted">Feito em</span>
        <span className="block text-sm tabular-nums">{formatDate(quote.issuedAt)}</span>
      </div>

      <div className="w-36 shrink-0">
        <span className="block text-xs text-content-muted">Vale até</span>
        <span className="block text-sm tabular-nums">{formatDate(quote.validUntil)}</span>
      </div>

      <div className="w-40 shrink-0">
        <StatusBadge status={quote.status} />
      </div>

      <div className="w-36 shrink-0 text-right">
        <span className="block text-xs text-content-muted">Total</span>
        <span className="block text-lg font-bold tabular-nums">
          {formatCurrency(quote.total)}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          label="Salvar PDF"
          icon="file-pdf"
          variant="secondary"
          size="sm"
          onClick={onExportPdf}
        />
        <Button
          label="Abrir"
          variant="ghost"
          size="sm"
          onClick={onOpen}
          aria-label={`Abrir orçamento ${quote.number} de ${quote.customerName}`}
        />
        <Icon name="caret-right" size={20} className="text-content-muted" />
      </div>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
      {children}
    </div>
  );
}
