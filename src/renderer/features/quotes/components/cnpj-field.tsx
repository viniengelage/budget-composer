import { useEffect, useRef, type ReactNode } from "react";

import { Icon, Spinner, TextField, type FieldTone } from "@/components/ui";
import { env } from "@/config/env";
import { useCnpjLookup } from "@/features/quotes/api/cnpj";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { CnpjLookupResult, CompanyLookup } from "@shared/cnpj";
import { maskCnpj, onlyDigits } from "@shared/format";

export interface CnpjFieldProps {
  value: string;
  onChange: (digits: string) => void;
  onCompanyFound: (company: CompanyLookup) => void;
}

interface FieldState {
  tone: FieldTone;
  hint: string;
  trailing: ReactNode;
}

const IDLE: FieldState = {
  tone: "default",
  hint: "Digite o CNPJ e preenchemos o resto. Pessoa física? Deixe em branco.",
  trailing: null,
};

function stateFor(
  digits: string,
  searching: boolean,
  result: CnpjLookupResult | undefined,
): FieldState {
  if (digits.length < 14) return IDLE;

  if (searching) {
    return {
      tone: "success",
      hint: "Buscando na Receita Federal…",
      trailing: <Spinner size={22} />,
    };
  }

  switch (result?.status) {
    case "found":
      return result.company.isActive
        ? {
            tone: "success",
            hint: "Dados preenchidos automaticamente",
            trailing: <Icon name="check-circle" size={22} />,
          }
        : {
            tone: "warning",
            hint: `Atenção: este CNPJ está ${result.company.registrationStatus.toUpperCase()} na Receita Federal.`,
            trailing: <Icon name="warning-circle" size={22} />,
          };

    case "not-found":
      return {
        tone: "error",
        hint: "CNPJ não encontrado. Pode preencher os dados à mão.",
        trailing: <Icon name="question" size={22} />,
      };

    case "error":
      return {
        tone: "warning",
        hint:
          result.reason === "timeout"
            ? "A Receita Federal demorou para responder. Pode preencher os dados à mão."
            : "Não consegui consultar agora. Pode preencher os dados à mão.",
        trailing: <Icon name="warning-circle" size={22} />,
      };

    default:
      return IDLE;
  }
}

export function CnpjField({ value, onChange, onCompanyFound }: CnpjFieldProps) {
  const digits = onlyDigits(value);
  const settled = useDebouncedValue(digits, env.cnpjDebounceMs);
  const settledIsCurrent = settled === digits && settled.length === 14;

  const { data, isFetching } = useCnpjLookup(settled, settledIsCurrent);

  // Preenche o resto do formulário uma vez por CNPJ consultado. Se a pessoa
  // corrigir o nome à mão depois, nenhum re-render desfaz a correção.
  const filledFor = useRef("");
  useEffect(() => {
    if (!settledIsCurrent || data?.status !== "found") return;
    if (filledFor.current === settled) return;

    filledFor.current = settled;
    onCompanyFound(data.company);
  }, [data, settled, settledIsCurrent, onCompanyFound]);

  const searching = digits.length === 14 && (!settledIsCurrent || isFetching);
  const state = stateFor(digits, searching, settledIsCurrent ? data : undefined);

  return (
    <TextField
      label="CNPJ do cliente"
      inputMode="numeric"
      placeholder="00.000.000/0000-00"
      value={maskCnpj(value)}
      onChange={(event) => onChange(onlyDigits(event.target.value))}
      tone={state.tone}
      hint={state.hint}
      trailing={state.trailing}
    />
  );
}
