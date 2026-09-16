import { useMutation, useQuery } from "@tanstack/react-query";

import { call } from "@/lib/rpc/client";

const POLL_MS = 15_000;

export function useUpdateState() {
  return useQuery({
    queryKey: ["update-state"],
    queryFn: () => call("updateState", {}),
    // Para de perguntar assim que a atualização está pronta: daí em diante
    // quem decide é a pessoa, não o relógio.
    refetchInterval: (query) => (query.state.data?.state === "ready" ? false : POLL_MS),
    retry: false,
  });
}

export function useApplyUpdate() {
  return useMutation({
    mutationFn: () => call("applyUpdate", {}),
  });
}
