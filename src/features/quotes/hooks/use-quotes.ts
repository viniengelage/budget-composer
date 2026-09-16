import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { quotesRepository } from "@/features/quotes/api/quotes-repository";
import type { Quote } from "@/types";

export const quotesKeys = {
  all: ["quotes"] as const,
  detail: (id: string) => ["quotes", id] as const,
};

export function useQuotes() {
  return useQuery({
    queryKey: quotesKeys.all,
    queryFn: quotesRepository.list,
  });
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: quotesKeys.detail(id),
    queryFn: () => quotesRepository.findById(id),
    enabled: id !== "",
  });
}

export function useSaveQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quote: Quote) => quotesRepository.update(quote),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: quotesKeys.all }),
  });
}

export function useDeleteQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotesRepository.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: quotesKeys.all }),
  });
}
