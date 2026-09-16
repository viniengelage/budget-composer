import { useState } from "react";

import { Page, PageBody, PageHeader } from "@/components/layouts/page";
import { Button, TextField } from "@/components/ui";
import { useProducts } from "@/features/products/api/products";
import { ProductList } from "@/features/products/components/product-list";

export function ProductsRoute() {
  const [search, setSearch] = useState("");
  const { data: products = [], isPending } = useProducts(search.trim());

  return (
    <Page>
      <PageHeader
        title="Produtos"
        subtitle="Cadastre seus produtos uma vez e use em todos os orçamentos"
        action={
          products.length > 0 ? (
            <Button
              label="Novo produto"
              icon="plus"
              size="lg"
              onClick={() => undefined}
            />
          ) : undefined
        }
      />

      <PageBody>
        <div className="mb-5 max-w-lg">
          <TextField
            label="Buscar"
            type="search"
            leadingIcon="magnifying-glass"
            placeholder="Nome do produto"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <ProductList
          products={products}
          isLoading={isPending}
          searchTerm={search.trim()}
          onCreate={() => undefined}
          onEdit={() => undefined}
          onClearSearch={() => setSearch("")}
        />
      </PageBody>
    </Page>
  );
}
