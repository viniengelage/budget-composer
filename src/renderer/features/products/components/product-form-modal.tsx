import { Button, Modal, SelectField, TextField } from "@/components/ui";
import { UNIT_OPTIONS } from "@/config/units";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/features/products/types/product-schema";
import { useZodForm } from "@/lib/form/use-zod-form";
import {
  digitsToCents,
  formatCurrency,
  formatCurrencyValue,
  unitLabel,
} from "@shared/format";
import type { Product, UnitOfMeasure } from "@shared/types";

export interface ProductFormModalProps {
  product: Product | null;
  saving: boolean;
  error: string | null;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
}

export function ProductFormModal({
  product,
  saving,
  error,
  onSubmit,
  onCancel,
}: ProductFormModalProps) {
  const isEditing = product !== null;

  const form = useZodForm(productFormSchema, {
    name: product?.name ?? "",
    unit: product?.unit ?? "m2",
    unitPrice: product?.unitPrice ?? 0,
    description: product?.description ?? "",
  });

  const { errors, isSubmitted } = form.formState;
  const values = form.watch();
  const unit = values.unit;

  const handlePriceChange = (raw: string) => {
    form.setValue("unitPrice", digitsToCents(raw), { shouldValidate: isSubmitted });
  };

  return (
    <Modal
      title={isEditing ? "Editar produto" : "Novo produto"}
      onClose={onCancel}
      footer={
        <>
          <Button label="Cancelar" variant="secondary" onClick={onCancel} />
          <Button
            label="Salvar produto"
            icon="check-circle"
            loading={saving}
            onClick={form.handleSubmit(onSubmit)}
          />
        </>
      }
    >
      <TextField
        label="Nome do produto"
        autoFocus
        placeholder="Grama esmeralda"
        tone={errors.name ? "error" : "default"}
        hint={errors.name?.message}
        {...form.register("name")}
      />

      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Unidade de medida"
          options={UNIT_OPTIONS}
          {...form.register("unit")}
        />

        <TextField
          label="Preço por unidade"
          inputMode="numeric"
          prefix="R$"
          suffix={`por ${unitLabel(unit)}`}
          value={formatCurrencyValue(values.unitPrice ?? 0)}
          onChange={(event) => handlePriceChange(event.target.value)}
          onBlur={() => void form.trigger("unitPrice")}
          tone={errors.unitPrice ? "error" : "default"}
          hint={errors.unitPrice?.message}
        />
      </div>

      <TextField
        label="Descrição que aparece no orçamento"
        optional
        placeholder="Entregue e espalhada"
        tone={errors.description ? "error" : "default"}
        hint={errors.description?.message}
        {...form.register("description")}
      />

      <PreviewLine
        name={values.name ?? ""}
        description={values.description ?? ""}
        unit={unit}
        unitPrice={values.unitPrice ?? 0}
      />

      {error ? (
        <p className="rounded-md bg-danger-50 px-4 py-3 text-sm text-content-danger">
          {error} Se continuar, pode preencher esse item à mão direto no orçamento.
        </p>
      ) : null}
    </Modal>
  );
}

/**
 * Mostra a linha exata que sai impressa. A pessoa não precisa imaginar o
 * resultado nem salvar para descobrir que ficou estranho.
 */
function PreviewLine({
  name,
  description,
  unit,
  unitPrice,
}: {
  name: string;
  description: string;
  unit: UnitOfMeasure;
  unitPrice: number;
}) {
  const text = description.trim() === "" ? name.trim() : description.trim();

  return (
    <div className="rounded-md bg-brand-soft px-4 py-3.5">
      <p className="text-xs font-bold tracking-wide text-brand-800 uppercase">
        No orçamento vai aparecer assim:
      </p>
      <p className="mt-1">
        {text === "" ? (
          <span className="text-content-muted">
            Escreva o nome acima para ver como fica.
          </span>
        ) : (
          <>
            {text} · {formatCurrency(unitPrice)} por {unitLabel(unit)}
          </>
        )}
      </p>
    </div>
  );
}
