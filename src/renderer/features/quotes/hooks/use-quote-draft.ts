import { useCallback, useMemo, useState } from "react";

import type {
  QuoteDraft,
  QuoteDraftCustomer,
  QuoteDraftItem,
} from "@/features/quotes/types/quote-schema";
import type { CompanyLookup } from "@shared/cnpj";
import { calculateQuoteTotals } from "@shared/quote-totals";
import type { Product } from "@shared/types";

const EMPTY_CUSTOMER: QuoteDraftCustomer = {
  id: null,
  name: "",
  document: "",
  phone: "",
  email: "",
  address: "",
  district: "",
  city: "",
  state: "",
  zipCode: "",
  stateRegistration: "",
};

const EMPTY_DRAFT: QuoteDraft = {
  customer: EMPTY_CUSTOMER,
  items: [],
  discount: 0,
  surcharge: 0,
  notes: "",
};

export function useQuoteDraft() {
  const [draft, setDraft] = useState<QuoteDraft>(EMPTY_DRAFT);

  const setCustomerField = useCallback(
    <Field extends keyof QuoteDraftCustomer>(
      field: Field,
      value: QuoteDraftCustomer[Field],
    ) => {
      setDraft((current) => ({
        ...current,
        customer: { ...current.customer, [field]: value },
      }));
    },
    [],
  );

  /**
   * A consulta de CNPJ preenche só o que ainda está em branco. Se a pessoa já
   * corrigiu o nome ou o telefone, a Receita Federal não passa por cima.
   */
  const applyCompanyLookup = useCallback((company: CompanyLookup) => {
    setDraft((current) => {
      const keep = (existing: string, incoming: string) =>
        existing.trim() === "" ? incoming : existing;

      return {
        ...current,
        customer: {
          ...current.customer,
          name: keep(current.customer.name, company.tradeName || company.name),
          phone: keep(current.customer.phone, company.phone),
          address: keep(current.customer.address, company.address),
          district: keep(current.customer.district, company.district),
          city: keep(current.customer.city, company.city),
          state: keep(current.customer.state, company.state),
          zipCode: keep(current.customer.zipCode, company.zipCode),
        },
      };
    });
  }, []);

  const addItemFromProduct = useCallback((product: Product) => {
    setDraft((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          key: crypto.randomUUID(),
          productId: product.id,
          description:
            product.description.trim() === "" ? product.name : product.description,
          unit: product.unit,
          quantity: 1,
          unitPrice: product.unitPrice,
        },
      ],
    }));
  }, []);

  const addBlankItem = useCallback(() => {
    setDraft((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          key: crypto.randomUUID(),
          productId: null,
          description: "",
          unit: "un",
          quantity: 1,
          unitPrice: 0,
        },
      ],
    }));
  }, []);

  const updateItem = useCallback(
    (key: string, patch: Partial<Omit<QuoteDraftItem, "key">>) => {
      setDraft((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.key === key ? { ...item, ...patch } : item,
        ),
      }));
    },
    [],
  );

  const removeItem = useCallback((key: string) => {
    setDraft((current) => ({
      ...current,
      items: current.items.filter((item) => item.key !== key),
    }));
  }, []);

  const setDiscount = useCallback(
    (discount: number) => setDraft((current) => ({ ...current, discount })),
    [],
  );

  const setSurcharge = useCallback(
    (surcharge: number) => setDraft((current) => ({ ...current, surcharge })),
    [],
  );

  const setNotes = useCallback(
    (notes: string) => setDraft((current) => ({ ...current, notes })),
    [],
  );

  const totals = useMemo(
    () => calculateQuoteTotals(draft.items, draft.discount, draft.surcharge),
    [draft.items, draft.discount, draft.surcharge],
  );

  return {
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
  };
}
