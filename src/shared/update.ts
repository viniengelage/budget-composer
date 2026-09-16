export type UpdateState = "idle" | "checking" | "downloading" | "ready";

export interface UpdateSnapshot {
  state: UpdateState;
  /** Versão que está pronta para instalar, quando houver. */
  version: string | null;
}
