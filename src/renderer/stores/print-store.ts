import { create } from "zustand";

import type { PrintOutcome } from "@/lib/print/print-when-ready";

interface PrintState {
  /** Id do orçamento a imprimir, ou null quando não há impressão em curso. */
  quoteId: string | null;
  /** True quando o webview deste sistema não abriu a janela de impressão. */
  unavailable: boolean;
  printQuote: (quoteId: string) => void;
  finish: (outcome: PrintOutcome) => void;
  dismiss: () => void;
}

export const usePrintStore = create<PrintState>((set) => ({
  quoteId: null,
  unavailable: false,

  printQuote: (quoteId) => set({ quoteId, unavailable: false }),
  finish: (outcome) => set({ quoteId: null, unavailable: outcome === "unavailable" }),
  dismiss: () => set({ unavailable: false }),
}));
