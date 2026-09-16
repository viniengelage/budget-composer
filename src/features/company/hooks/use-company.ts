import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { companyRepository } from "@/features/company/api/company-repository";
import type { Company } from "@/types";

export const companyKeys = { detail: ["company"] as const };

export function useCompany() {
  return useQuery({
    queryKey: companyKeys.detail,
    queryFn: companyRepository.get,
  });
}

export function useSaveCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (company: Company) => companyRepository.save(company),
    onSuccess: (company) => queryClient.setQueryData(companyKeys.detail, company),
  });
}
