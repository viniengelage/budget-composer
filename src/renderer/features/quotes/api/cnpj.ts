import { useQuery } from "@tanstack/react-query";

import { call } from "@/lib/rpc/client";

export function useCnpjLookup(cnpj: string, enabled: boolean) {
  return useQuery({
    queryKey: ["cnpj", cnpj],
    queryFn: () => call("lookupCnpj", { cnpj }),
    enabled,
    // A Receita não muda de resposta enquanto a janela está aberta, e a
    // consulta é a única coisa neste app que sai para a internet.
    staleTime: Infinity,
    retry: false,
  });
}
