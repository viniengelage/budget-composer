import { useCallback, useState } from "react";

import { Page, PageBody, PageHeader } from "@/components/layouts/page";
import { Button, Icon } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { useCompany } from "@/features/company/api/company";
import { useProducts } from "@/features/products/api/products";
import { useCreateQuote, useNextQuoteNumber } from "@/features/quotes/api/quotes";
import { CustomerCard } from "@/features/quotes/components/customer-card";
import { ItemsCard } from "@/features/quotes/components/items-card";
import { NotesCard } from "@/features/quotes/components/notes-card";
import { ProductPickerModal } from "@/features/quotes/components/product-picker-modal";
import { TotalsCard } from "@/features/quotes/components/totals-card";
import { useQuoteDraft } from "@/features/quotes/hooks/use-quote-draft";
import {
  validateQuoteDraft,
  type QuoteDraftErrors,
} from "@/features/quotes/types/quote-schema";
import { useNavigationStore } from "@/stores/navigation-store";
import { addDays, toIsoDate } from "@shared/format";
import type { Product } from "@shared/types";

export function QuoteCreateRoute() {
  const navigate = useNavigationStore((state) => state.navigate);

  const {
    draft,
    totals,
    setCustomerField,
    applyCompanyLookup,
    addItemFromProduct,
    addBlankItem,
    updateItem,
    removeItem,
    setDiscount,
    setSurcharge,
    setNotes,
  } = useQuoteDraft();

  const [errors, setErrors] = useState<QuoteDraftErrors>({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  const { data: nextNumber } = useNextQuoteNumber();
  const { data: company } = useCompany();
  const { data: pickerProducts = [], isPending: loadingProducts } =
    useProducts(pickerSearch.trim());
  const createQuote = useCreateQuote();

  const goBack = () => navigate(ROUTES.quotes);

  const openPicker = useCallback(() => {
    setPickerSearch("");
    setPickerOpen(true);
  }, []);

  const pickProduct = (product: Product) => {
    addItemFromProduct(product);
    setPickerOpen(false);
  };

  const writeByHand = () => {
    addBlankItem();
    setPickerOpen(false);
  };

  const save = () => {
    const found = validateQuoteDraft(draft);
    setErrors(found ?? {});
    if (found) return;

    const issuedAt = toIsoDate(new Date());

    createQuote.mutate(
      {
        customer: draft.customer,
        items: draft.items.map((item) => ({
          productId: item.productId,
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        discount: draft.discount,
        surcharge: draft.surcharge,
        notes: draft.notes,
        issuedAt,
        validUntil: addDays(issuedAt, company?.defaultValidityDays ?? 15),
        status: "pending",
      },
      { onSuccess: goBack },
    );
  };

  return (
    <Page>
      <PageHeader
        title="Novo orçamento"
        subtitle="Preencha os dados abaixo. O total é calculado sozinho."
        leading={
          <button
            type="button"
            onClick={goBack}
            aria-label="Voltar para a lista de orçamentos"
            className="mt-1 flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-md border-[1.5px] border-line-strong bg-surface text-content transition-colors hover:bg-subtle"
          >
            <Icon name="caret-left" size={22} />
          </button>
        }
        action={
          nextNumber === undefined ? undefined : (
            <div className="rounded-md bg-brand-soft px-5 py-3 text-right">
              <span className="block text-xs font-bold tracking-wide text-brand-700 uppercase">
                Orçamento
              </span>
              <span className="block text-xl font-bold text-brand-800">
                Nº {nextNumber}
              </span>
            </div>
          )
        }
      />

      <PageBody className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6">
        <div className="flex flex-col gap-6">
          <CustomerCard
            customer={draft.customer}
            errors={errors}
            onChange={setCustomerField}
            onCompanyFound={applyCompanyLookup}
          />

          <ItemsCard
            items={draft.items}
            errors={errors}
            onUpdate={updateItem}
            onRemove={removeItem}
            onAdd={openPicker}
          />
        </div>

        <div className="flex flex-col gap-6">
          <TotalsCard
            totals={totals}
            onDiscountChange={setDiscount}
            onSurchargeChange={setSurcharge}
          />

          <NotesCard notes={draft.notes} onChange={setNotes} />

          <div className="flex flex-col gap-3">
            <Button
              label="Salvar orçamento"
              icon="check-circle"
              size="lg"
              fullWidth
              loading={createQuote.isPending}
              onClick={save}
            />
            <Button
              label="Cancelar e voltar"
              variant="ghost"
              fullWidth
              onClick={goBack}
            />

            {createQuote.error ? (
              <p className="rounded-md bg-danger-50 px-4 py-3 text-sm text-content-danger">
                {createQuote.error.message}
              </p>
            ) : null}
          </div>
        </div>
      </PageBody>

      {pickerOpen ? (
        <ProductPickerModal
          products={pickerProducts}
          isLoading={loadingProducts}
          search={pickerSearch}
          onSearchChange={setPickerSearch}
          onPick={pickProduct}
          onWriteByHand={writeByHand}
          onCancel={() => setPickerOpen(false)}
        />
      ) : null}
    </Page>
  );
}
