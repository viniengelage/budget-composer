import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { call } from "@/lib/rpc/client";
import type { Company } from "@shared/types";

export const companyKeys = {
  all: ["company"] as const,
  info: ["app-info"] as const,
};

export function useCompany() {
  return useQuery({
    queryKey: companyKeys.all,
    queryFn: () => call("getCompany", {}),
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Company) => call("updateCompany", { input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: companyKeys.all }),
  });
}

export function useAppInfo() {
  return useQuery({
    queryKey: companyKeys.info,
    queryFn: () => call("appInfo", {}),
    staleTime: Infinity,
  });
}
