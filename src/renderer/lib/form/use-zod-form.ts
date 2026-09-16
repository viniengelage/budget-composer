import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import type { z } from "zod";

/**
 * Único ponto onde o react-hook-form aparece. Fixa o modo de validação que
 * este app usa em todo formulário: avisa quando a pessoa **sai** do campo, não
 * enquanto ela digita — erro piscando a cada tecla assusta mais do que ajuda.
 * Depois do primeiro aviso, revalida a cada tecla, para o erro sumir assim que
 * for corrigido.
 */
export function useZodForm<Values extends FieldValues>(
  schema: z.ZodType<Values, Values>,
  defaultValues: DefaultValues<Values>,
): UseFormReturn<Values> {
  return useForm<Values>({
    resolver: zodResolver(schema) as Resolver<Values>,
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });
}
