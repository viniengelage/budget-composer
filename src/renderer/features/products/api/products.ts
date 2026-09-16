import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { call } from "@/lib/rpc/client";
import type { ProductInput } from "@shared/rpc-contract";

export const productKeys = {
  all: ["products"] as const,
  list: (search: string) => ["products", "list", search] as const,
};

export function useProducts(search = "") {
  return useQuery({
    queryKey: productKeys.list(search),
    queryFn: () => call("listProducts", { search }),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProductInput) => call("createProduct", { input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) =>
      call("updateProduct", { id, input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useArchiveProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => call("archiveProduct", { id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}
