import type { UnitOfMeasure } from "@shared/types";

/**
 * Rótulos das unidades como a pessoa lê na tela. Fica na camada compartilhada
 * porque tanto Produtos quanto Orçamentos precisam deles, e feature não
 * importa de feature.
 */
export const UNIT_OPTIONS: readonly { value: UnitOfMeasure; label: string }[] = [
  { value: "m2", label: "m² — metro quadrado" },
  { value: "m", label: "m — metro" },
  { value: "un", label: "un — unidade" },
  { value: "saco", label: "saco" },
  { value: "servico", label: "serviço" },
  { value: "hora", label: "h — hora" },
];
