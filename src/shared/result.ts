/**
 * Todo handler de RPC devolve este envelope em vez de estourar exceção.
 * Uma exceção atravessando o RPC vira "timeout" genérico do outro lado; o
 * envelope preserva a frase em português que a tela precisa mostrar.
 */
export type Result<T> = { ok: true; data: T } | { ok: false; message: string };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function fail<T = never>(message: string): Result<T> {
  return { ok: false, message };
}

const FALLBACK_MESSAGE =
  "Algo deu errado aqui dentro do programa. Tente de novo; se continuar, feche e abra o programa.";

export function attempt<T>(fn: () => T): Result<T> {
  try {
    return ok(fn());
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return fail(message === "" ? FALLBACK_MESSAGE : message);
  }
}

export async function attemptAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return fail(message === "" ? FALLBACK_MESSAGE : message);
  }
}
