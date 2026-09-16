import { Button, Icon, Modal, Spinner, TextField } from "@/components/ui";
import { formatCurrency, unitLabel } from "@shared/format";
import type { Product } from "@shared/types";

/**
 * Puramente apresentacional: quem busca os produtos é a camada `app`. Uma
 * feature não importa dados de outra feature.
 */
export interface ProductPickerModalProps {
  products: Product[];
  isLoading: boolean;
  search: string;
  onSearchChange: (search: string) => void;
  onPick: (product: Product) => void;
  onWriteByHand: () => void;
  onCancel: () => void;
}

export function ProductPickerModal({
  products,
  isLoading,
  search,
  onSearchChange,
  onPick,
  onWriteByHand,
  onCancel,
}: ProductPickerModalProps) {

  return (
    <Modal
      title="Adicionar produto"
      onClose={onCancel}
      footer={
        <>
          <Button label="Cancelar" variant="secondary" onClick={onCancel} />
          <Button
            label="Escrever item à mão"
            icon="note-pencil"
            variant="secondary"
            onClick={onWriteByHand}
          />
        </>
      }
    >
      <TextField
        label="Buscar produto"
        type="search"
        autoFocus
        leadingIcon="magnifying-glass"
        placeholder="Grama, adubo, frete…"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 py-10 text-content-muted">
          <Spinner size={24} />
          Carregando…
        </div>
      ) : products.length === 0 ? (
        <p className="py-8 text-center text-content-muted">
          {search.trim() === ""
            ? "Você ainda não cadastrou produtos. Pode escrever o item à mão aqui embaixo."
            : `Nenhum produto com "${search.trim()}". Pode escrever o item à mão aqui embaixo.`}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {products.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => onPick(product)}
                className="flex w-full cursor-pointer items-center gap-4 rounded-md border border-line px-4 py-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-soft"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{product.name}</span>
                  {product.description === "" ? null : (
                    <span className="block text-sm text-content-muted">
                      {product.description}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-semibold tabular-nums">
                    {formatCurrency(product.unitPrice)}
                  </span>
                  <span className="block text-xs text-content-muted">
                    por {unitLabel(product.unit)}
                  </span>
                </span>
                <Icon name="plus" size={22} className="shrink-0 text-content-brand" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
