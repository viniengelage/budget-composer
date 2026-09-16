import { useState } from "react";

import { Card, Icon, TextField } from "@/components/ui";
import { CnpjField } from "@/features/quotes/components/cnpj-field";
import type {
  QuoteDraftCustomer,
  QuoteDraftErrors,
} from "@/features/quotes/types/quote-schema";
import type { CompanyLookup } from "@shared/cnpj";

export interface CustomerCardProps {
  customer: QuoteDraftCustomer;
  errors: QuoteDraftErrors;
  onChange: <Field extends keyof QuoteDraftCustomer>(
    field: Field,
    value: QuoteDraftCustomer[Field],
  ) => void;
  onCompanyFound: (company: CompanyLookup) => void;
}

export function CustomerCard({
  customer,
  errors,
  onChange,
  onCompanyFound,
}: CustomerCardProps) {
  const [showExtra, setShowExtra] = useState(false);

  return (
    <Card title="Cliente" step={1}>
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        <CnpjField
          value={customer.document}
          onChange={(digits) => onChange("document", digits)}
          onCompanyFound={onCompanyFound}
        />

        <TextField
          label="Nome do cliente"
          placeholder="Espaço das Américas"
          value={customer.name}
          onChange={(event) => onChange("name", event.target.value)}
          tone={errors["customer.name"] ? "error" : "default"}
          hint={errors["customer.name"]}
        />

        <TextField
          label="Telefone"
          inputMode="tel"
          placeholder="(45) 3025-1180"
          value={customer.phone}
          onChange={(event) => onChange("phone", event.target.value)}
        />

        <TextField
          label="Cidade"
          placeholder="Foz do Iguaçu"
          value={customer.city}
          onChange={(event) => onChange("city", event.target.value)}
        />

        <TextField
          label="Endereço"
          placeholder="Av. das Cataratas, 1.500"
          value={customer.address}
          onChange={(event) => onChange("address", event.target.value)}
        />

        <TextField
          label="Bairro"
          placeholder="Três Fronteiras"
          value={customer.district}
          onChange={(event) => onChange("district", event.target.value)}
        />

        {showExtra ? (
          <>
            <TextField
              label="RG ou Inscrição Estadual"
              optional
              value={customer.stateRegistration}
              onChange={(event) => onChange("stateRegistration", event.target.value)}
            />

            <TextField
              label="Estado"
              optional
              placeholder="PR"
              maxLength={2}
              value={customer.state}
              onChange={(event) =>
                onChange("state", event.target.value.toUpperCase().slice(0, 2))
              }
            />

            <TextField
              label="CEP"
              optional
              inputMode="numeric"
              placeholder="85850-000"
              value={customer.zipCode}
              onChange={(event) => onChange("zipCode", event.target.value)}
            />

            <TextField
              label="E-mail"
              optional
              type="email"
              value={customer.email}
              onChange={(event) => onChange("email", event.target.value)}
            />
          </>
        ) : null}
      </div>

      {showExtra ? null : (
        <button
          type="button"
          onClick={() => setShowExtra(true)}
          className="inline-flex cursor-pointer items-center gap-2 self-start rounded-md py-1 font-semibold text-content-brand hover:underline"
        >
          <Icon name="plus" size={20} />
          Mais dados do cliente (RG/IE, estado e CEP)
        </button>
      )}
    </Card>
  );
}
