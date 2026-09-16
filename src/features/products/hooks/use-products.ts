import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { productsRepository } from "@/features/products/api/products-repository";
import type { Product } from "@/types";

export const productsKeys = { all: ["products"] as const };

export function useProducts() {
  return useQuery({
    queryKey: productsKeys.all,
    queryFn: productsRepository.list,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draft: Omit<Product, "id" | "createdAt" | "updatedAt">) =>
      productsRepository.create(draft),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productsKeys.all }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsRepository.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productsKeys.all }),
  });
}
