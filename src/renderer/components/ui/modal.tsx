import { useEffect, type ReactNode } from "react";

import { Icon } from "@/components/ui/icon";

export interface ModalProps {
  title: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Fecha no Esc e no X, mas **não** no clique fora: quem está digitando um
 * cadastro não pode perder o que escreveu por um clique torto ao lado da
 * janela.
 */
export function Modal({ title, onClose, footer, children }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ backgroundColor: "rgb(12 21 18 / 0.62)" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-full w-full max-w-[560px] flex-col overflow-hidden rounded-lg bg-surface shadow-float"
      >
        <header className="flex items-center gap-4 border-b border-line px-6 py-5">
          <h2 className="flex-1 text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar sem salvar"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-content-muted transition-colors hover:bg-subtle hover:text-content"
          >
            <Icon name="x" size={22} />
          </button>
        </header>

        <div className="scroll-area flex flex-col gap-5 px-6 py-6">{children}</div>

        {footer ? (
          <footer className="flex justify-end gap-3 border-t border-line px-6 py-5">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
