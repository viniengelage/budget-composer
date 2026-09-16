export type JsonResponse =
  | { outcome: "response"; status: number; body: unknown }
  | { outcome: "timeout" }
  | { outcome: "network" };

/**
 * Único lugar do app que fala HTTP com o mundo. Existe por causa de um detalhe
 * que custa caro descobrir em produção:
 *
 * O `fetch` do Cottontail **não descomprime a resposta**. Um servidor que
 * responde com `Content-Encoding: br` (o caso da BrasilAPI) ou `gzip` faz a
 * chamada estourar com "Decompression error" — e, de dentro de um `catch`
 * genérico, isso parece internet fora. Pedindo `identity` o servidor manda o
 * corpo cru e tudo funciona.
 *
 * Por isso nenhuma requisição deve usar `fetch` direto: todas passam por aqui,
 * senão a próxima integração vai reaprender isto do zero.
 */
export async function fetchJson(url: string, timeoutMs: number): Promise<JsonResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "Accept-Encoding": "identity" },
    });

    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // Resposta sem JSON (404 em HTML, por exemplo): o status já diz o que
      // aconteceu, e quem chamou decide o que fazer.
      body = null;
    }

    return { outcome: "response", status: response.status, body };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return { outcome: aborted ? "timeout" : "network" };
  } finally {
    clearTimeout(timer);
  }
}
