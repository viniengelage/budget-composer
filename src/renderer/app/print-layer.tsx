import { useEffect, useRef } from "react";

import { Button, Icon, Modal } from "@/components/ui";
import { useCompany } from "@/features/company/api/company";
import { useQuote } from "@/features/quotes/api/quotes";
import { QuoteDocument } from "@/features/quotes/components/quote-document";
import { printWhenReady } from "@/lib/print/print-when-ready";
import { usePrintStore } from "@/stores/print-store";

/**
 * Fica montado ao lado do app inteiro. Enquanto não há impressão em curso não
 * renderiza nada; quando há, monta o documento A4 fora do fluxo da tela e
 * manda imprimir assim que ele estiver desenhado.
 */
export function PrintLayer() {
  const quoteId = usePrintStore((state) => state.quoteId);
  const unavailable = usePrintStore((state) => state.unavailable);
  const finish = usePrintStore((state) => state.finish);
  const dismiss = usePrintStore((state) => state.dismiss);

  const { data: quote } = useQuote(quoteId);
  const { data: company } = useCompany();

  const containerRef = useRef<HTMLDivElement>(null);
  const printingFor = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (quoteId === null || !quote || !company || !container) return;
    if (printingFor.current === quoteId) return;

    printingFor.current = quoteId;

    void printWhenReady(container)
      .then(finish)
      .finally(() => {
        printingFor.current = null;
      });
  }, [quoteId, quote, company, finish]);

  return (
    <>
      {quoteId !== null && quote && company ? (
        <div ref={containerRef} className="print-root">
          <QuoteDocument quote={quote} company={company} />
        </div>
      ) : null}

      {unavailable ? <PrintUnavailableNotice onClose={dismiss} /> : null}
    </>
  );
}

function PrintUnavailableNotice({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      title="Não consegui abrir a impressão"
      onClose={onClose}
      footer={<Button label="Entendi" onClick={onClose} />}
    >
      <div className="flex gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-warning-50 text-warning-600">
          <Icon name="warning-circle" size={28} />
        </span>
        <div className="flex flex-col gap-2">
          <p className="font-semibold">
            Este computador não abriu a janela de imprimir.
          </p>
          <p className="text-sm text-content-muted">
            O orçamento foi salvo e está na lista — nada foi perdido. A impressão em
            PDF funciona no Windows; em outros sistemas ela ainda não está disponível.
          </p>
        </div>
      </div>
    </Modal>
  );
}
