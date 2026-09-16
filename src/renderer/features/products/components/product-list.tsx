import { Button, EmptyState, Spinner } from "@/components/ui";
import { formatCurrency, unitLabel } from "@shared/format";
import type { Product } from "@shared/types";

export interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  searchTerm: string;
  onCreate: () => void;
  onEdit: (product: Product) => void;
  onClearSearch: () => void;
}

export function ProductList({
  products,
  isLoading,
  searchTerm,
  onCreate,
  onEdit,
  onClearSearch,
}: ProductListProps) {
  if (isLoading) {
    return (
      <Panel>
        <div className="flex items-center justify-center gap-3 p-16 text-content-muted">
          <Spinner size={28} />
          Carregando seus produtos…
        </div>
      </Panel>
    );
  }

  if (products.length === 0 && searchTerm !== "") {
    return (
      <Panel>
        <EmptyState
          icon="magnifying-glass"
          tone="neutral"
          title="Nenhum produto encontrado"
          description={`Não achei nada com "${searchTerm}". Confira se escreveu certo, ou volte para a lista completa.`}
        >
          <Button
            label="Mostrar todos"
            variant="secondary"
            size="lg"
            onClick={onClearSearch}
          />
        </EmptyState>
      </Panel>
    );
  }

  if (products.length === 0) {
    return (
      <Panel>
        <EmptyState
          icon="package"
          title="Nenhum produto cadastrado"
          description="Cadastre a grama, o frete, o preparo do solo… Depois é só escolher na hora de montar o orçamento, sem digitar o preço de novo."
        >
          <Button
            label="Cadastrar primeiro produto"
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
        {products.map((product) => (
          <li key={product.id} className="flex items-center gap-5 px-6 py-5">
            <div className="min-w-0 flex-1">
              <span className="block truncate text-base font-semibold">
                {product.name}
              </span>
              {product.description === "" ? null : (
                <span className="block truncate text-sm text-content-muted">
                  {product.description}
                </span>
              )}
            </div>

            <div className="w-28 shrink-0">
              <span className="block text-xs text-content-muted">Medida</span>
              <span className="block text-sm">{unitLabel(product.unit)}</span>
            </div>

            <div className="w-40 shrink-0 text-right">
              <span className="block text-xs text-content-muted">Preço</span>
              <span className="block text-lg font-bold tabular-nums">
                {formatCurrency(product.unitPrice)}
              </span>
            </div>

            <Button
              label="Editar"
              icon="pencil-simple"
              variant="secondary"
              size="sm"
              onClick={() => onEdit(product)}
              aria-label={`Editar ${product.name}`}
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
      {children}
    </div>
  );
}
