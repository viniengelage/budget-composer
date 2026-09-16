import { useCallback, useState } from "react";

import { Page, PageBody, PageHeader } from "@/components/layouts/page";
import { Button, ConfirmDialog, EmptyState, Spinner } from "@/components/ui";
import {
  useArchiveProduct,
  useCreateProduct,
  useProducts,
  useUpdateProduct,
} from "@/features/products/api/products";
import { ProductFormModal } from "@/features/products/components/product-form-modal";
import { ProductsTable } from "@/features/products/components/products-table";
import type { ProductFormValues } from "@/features/products/types/product-schema";
import type { Product } from "@shared/types";

type Dialog =
  | { kind: "none" }
  | { kind: "form"; product: Product | null }
  | { kind: "delete"; product: Product };

export function ProductsRoute() {
  const [dialog, setDialog] = useState<Dialog>({ kind: "none" });

  const { data: products = [], isPending } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const archiveProduct = useArchiveProduct();

  const close = useCallback(() => {
    createProduct.reset();
    updateProduct.reset();
    archiveProduct.reset();
    setDialog({ kind: "none" });
  }, [createProduct, updateProduct, archiveProduct]);

  const openCreate = useCallback(() => setDialog({ kind: "form", product: null }), []);
  const openEdit = useCallback(
    (product: Product) => setDialog({ kind: "form", product }),
    [],
  );
  const openDelete = useCallback(
    (product: Product) => setDialog({ kind: "delete", product }),
    [],
  );

  const save = (values: ProductFormValues) => {
    if (dialog.kind !== "form") return;

    const input = {
      name: values.name,
      description: values.description,
      unit: values.unit,
      unitPrice: values.unitPrice,
    };

    const editing = dialog.product;
    if (editing) {
      updateProduct.mutate({ id: editing.id, input }, { onSuccess: close });
    } else {
      createProduct.mutate(input, { onSuccess: close });
    }
  };

  const isEmpty = !isPending && products.length === 0;

  return (
    <Page>
      <PageHeader
        title="Produtos"
        subtitle="Cadastre seus produtos uma vez e use em todos os orçamentos"
        action={
          isEmpty ? undefined : (
            <Button label="Novo produto" icon="plus" size="lg" onClick={openCreate} />
          )
        }
      />

      <PageBody>
        {isPending ? (
          <Panel>
            <div className="flex items-center justify-center gap-3 p-16 text-content-muted">
              <Spinner size={28} />
              Carregando seus produtos…
            </div>
          </Panel>
        ) : isEmpty ? (
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
                onClick={openCreate}
              />
            </EmptyState>
          </Panel>
        ) : (
          <ProductsTable products={products} onEdit={openEdit} onDelete={openDelete} />
        )}
      </PageBody>

      {dialog.kind === "form" ? (
        <ProductFormModal
          product={dialog.product}
          saving={createProduct.isPending || updateProduct.isPending}
          error={errorMessage(createProduct.error ?? updateProduct.error)}
          onSubmit={save}
          onCancel={close}
        />
      ) : null}

      {dialog.kind === "delete" ? (
        <ConfirmDialog
          title="Excluir produto"
          question={`Quer mesmo excluir "${dialog.product.name}"?`}
          detail="Ele some da lista na hora de montar novos orçamentos. Os orçamentos que você já fez continuam iguais, com esse produto impresso do mesmo jeito."
          confirmLabel="Sim, excluir"
          destructive
          busy={archiveProduct.isPending}
          error={errorMessage(archiveProduct.error)}
          onConfirm={() => archiveProduct.mutate(dialog.product.id, { onSuccess: close })}
          onCancel={close}
        />
      ) : null}
    </Page>
  );
}

function errorMessage(error: unknown): string | null {
  if (error === null || error === undefined) return null;
  return error instanceof Error ? error.message : "Não consegui salvar.";
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
      {children}
    </div>
  );
}
