import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { call } from "@/lib/rpc/client";
import type { QuoteInput } from "@shared/rpc-contract";
import type { QuoteStatus } from "@shared/types";

export const quoteKeys = {
  all: ["quotes"] as const,
  list: (search: string) => ["quotes", "list", search] as const,
  detail: (id: string) => ["quotes", "detail", id] as const,
};

export function useQuotes(search = "") {
  return useQuery({
    queryKey: quoteKeys.list(search),
    queryFn: () => call("listQuotes", { search }),
  });
}

export function useQuote(id: string | null) {
  return useQuery({
    queryKey: quoteKeys.detail(id ?? ""),
    queryFn: () => call("getQuote", { id: id ?? "" }),
    enabled: id !== null,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: QuoteInput) => call("createQuote", { input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: quoteKeys.all }),
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: QuoteInput }) =>
      call("updateQuote", { id, input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: quoteKeys.all }),
  });
}

export function useSetQuoteStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuoteStatus }) =>
      call("setQuoteStatus", { id, status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: quoteKeys.all }),
  });
}

export function useDeleteQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => call("deleteQuote", { id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: quoteKeys.all }),
  });
}
