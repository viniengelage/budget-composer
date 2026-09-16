import Electrobun, { Electroview } from "electrobun/view";

import type { AppRequests } from "@shared/rpc-contract";

type AppRPC = {
  bun: { requests: AppRequests; messages: Record<string, never> };
  webview: { requests: Record<string, never>; messages: Record<string, never> };
};

type Unwrap<T> = T extends { ok: true; data: infer Data } ? Data : never;

export type RequestName = keyof AppRequests;
export type RequestParams<K extends RequestName> = AppRequests[K]["params"];
export type RequestData<K extends RequestName> = Unwrap<AppRequests[K]["response"]>;

/**
 * Erro com frase pronta para a tela. Toda mensagem que chega aqui já foi
 * escrita em português no processo principal.
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}

const NO_BRIDGE_MESSAGE =
  "O programa não conseguiu falar com a parte que guarda os dados. Feche e abra o programa de novo.";

const rpc = Electroview.defineRPC<AppRPC>({
  maxRequestTime: 15000,
  handlers: { requests: {}, messages: {} },
});

const electroview = new Electrobun.Electroview({ rpc });

type RequestBridge = {
  [K in RequestName]: (params: RequestParams<K>) => Promise<AppRequests[K]["response"]>;
};

export async function call<K extends RequestName>(
  name: K,
  params: RequestParams<K>,
): Promise<RequestData<K>> {
  const bridge = electroview.rpc?.request as RequestBridge | undefined;
  if (!bridge) throw new AppError(NO_BRIDGE_MESSAGE);

  const result = await bridge[name](params);
  if (!result.ok) throw new AppError(result.message);

  return result.data as RequestData<K>;
}
