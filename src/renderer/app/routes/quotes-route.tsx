import { useState } from "react";

import { Page, PageBody, PageHeader } from "@/components/layouts/page";
import { Button, TextField } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { useQuotes } from "@/features/quotes/api/quotes";
import { QuoteList } from "@/features/quotes/components/quote-list";
import { useNavigationStore } from "@/stores/navigation-store";

export function QuotesRoute() {
  const navigate = useNavigationStore((state) => state.navigate);
  const [search, setSearch] = useState("");
  const { data: quotes = [], isPending } = useQuotes(search.trim());

  const goToCreate = () => navigate(ROUTES.quoteCreate);

  return (
    <Page>
      <PageHeader
        title="Orçamentos"
        subtitle="Veja, crie e imprima os orçamentos dos seus clientes"
        action={
          <Button label="Novo orçamento" icon="plus" size="lg" onClick={goToCreate} />
        }
      />

      <PageBody>
        <div className="mb-5 max-w-lg">
          <TextField
            label="Buscar"
            type="search"
            leadingIcon="magnifying-glass"
            placeholder="Nome do cliente ou número do orçamento"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <QuoteList
          quotes={quotes}
          isLoading={isPending}
          searchTerm={search.trim()}
          onOpen={() => undefined}
          onExportPdf={() => undefined}
          onCreate={goToCreate}
          onClearSearch={() => setSearch("")}
        />
      </PageBody>
    </Page>
  );
}
