import { Card, TextField } from "@/components/ui";
import type { CompanyFormErrors } from "@/features/company/types/company-schema";
import type { Company } from "@shared/types";

type SetField = <Field extends keyof Company>(
  field: Field,
  value: Company[Field],
) => void;

interface CardProps {
  company: Company;
  errors: CompanyFormErrors;
  onChange: SetField;
}

export function CompanyDetailsCard({ company, errors, onChange }: CardProps) {
  return (
    <Card title="Dados da empresa">
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        <TextField
          label="Nome da empresa"
          placeholder="Grameira do Jonas"
          value={company.name}
          onChange={(event) => onChange("name", event.target.value)}
          tone={errors["name"] ? "error" : "default"}
          hint={errors["name"]}
        />

        <TextField
          label="CNPJ ou CPF"
          inputMode="numeric"
          value={company.document}
          onChange={(event) => onChange("document", event.target.value)}
        />

        <TextField
          label="Telefone"
          inputMode="tel"
          value={company.phone}
          onChange={(event) => onChange("phone", event.target.value)}
        />

        <TextField
          label="E-mail"
          type="email"
          value={company.email}
          onChange={(event) => onChange("email", event.target.value)}
        />
      </div>
    </Card>
  );
}

export function AddressCard({ company, onChange }: CardProps) {
  return (
    <Card title="Endereço">
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        <TextField
          label="Rua e número"
          value={company.address}
          onChange={(event) => onChange("address", event.target.value)}
        />

        <TextField
          label="Bairro"
          value={company.district}
          onChange={(event) => onChange("district", event.target.value)}
        />
      </div>

      <div className="grid grid-cols-[1fr_120px_180px] gap-x-5">
        <TextField
          label="Cidade"
          value={company.city}
          onChange={(event) => onChange("city", event.target.value)}
        />

        <TextField
          label="Estado"
          maxLength={2}
          value={company.state}
          onChange={(event) =>
            onChange("state", event.target.value.toUpperCase().slice(0, 2))
          }
        />

        <TextField
          label="CEP"
          inputMode="numeric"
          value={company.zipCode}
          onChange={(event) => onChange("zipCode", event.target.value)}
        />
      </div>
    </Card>
  );
}

export function PaymentCard({ company, onChange }: CardProps) {
  return (
    <Card title="Pagamento (aparece no orçamento)">
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        <TextField
          label="Chave Pix"
          value={company.pixKey}
          onChange={(event) => onChange("pixKey", event.target.value)}
        />

        <TextField
          label="Nome do titular"
          value={company.pixHolder}
          onChange={(event) => onChange("pixHolder", event.target.value)}
        />
      </div>
    </Card>
  );
}

export function ValidityCard({ company, errors, onChange }: CardProps) {
  return (
    <Card title="Validade (aparece no orçamento)">
      <div className="grid grid-cols-2 gap-x-5">
        <TextField
          label="Quantos dias o orçamento vale"
          inputMode="numeric"
          suffix="dias"
          value={String(company.defaultValidityDays)}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "").slice(0, 3);
            onChange("defaultValidityDays", digits === "" ? 0 : Number(digits));
          }}
          tone={errors["defaultValidityDays"] ? "error" : "default"}
          hint={
            errors["defaultValidityDays"] ??
            "Contado a partir do dia em que você cria o orçamento."
          }
        />
      </div>
    </Card>
  );
}
