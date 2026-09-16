import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { fetchJson } from "@main/services/http/fetch-json";

let server: ReturnType<typeof Bun.serve>;
let baseUrl = "";

beforeAll(() => {
  server = Bun.serve({
    port: 0,
    async fetch(request) {
      const { pathname } = new URL(request.url);

      switch (pathname) {
        case "/echo-headers":
          return Response.json({
            acceptEncoding: request.headers.get("accept-encoding"),
          });

        case "/nao-existe":
          return new Response("não achei", { status: 404 });

        case "/quebrado":
          return new Response("<html>erro do servidor</html>", { status: 500 });

        case "/devagar":
          await Bun.sleep(400);
          return Response.json({ tarde: true });

        default:
          return Response.json({ ok: true });
      }
    },
  });

  baseUrl = `http://localhost:${server.port}`;
});

afterAll(() => {
  server.stop(true);
});

describe("fetchJson", () => {
  /**
   * Este é o teste que importa. O fetch do Cottontail não descomprime a
   * resposta: sem pedir `identity`, um servidor que responde em Brotli ou gzip
   * derruba a chamada com "Decompression error", que de dentro do catch parece
   * internet fora. Foi assim que a busca de CNPJ ficou quebrada.
   */
  test("pede a resposta sem compressão", async () => {
    const result = await fetchJson(`${baseUrl}/echo-headers`, 2000);

    expect(result.outcome).toBe("response");
    if (result.outcome !== "response") return;

    expect(result.body).toEqual({ acceptEncoding: "identity" });
  });

  test("resposta boa devolve corpo e status", async () => {
    const result = await fetchJson(`${baseUrl}/qualquer`, 2000);

    expect(result).toEqual({ outcome: "response", status: 200, body: { ok: true } });
  });

  test("404 não é erro de transporte — quem chamou decide", async () => {
    const result = await fetchJson(`${baseUrl}/nao-existe`, 2000);

    expect(result.outcome).toBe("response");
    if (result.outcome !== "response") return;
    expect(result.status).toBe(404);
  });

  test("resposta sem JSON não estoura: corpo vira null", async () => {
    const result = await fetchJson(`${baseUrl}/quebrado`, 2000);

    expect(result).toEqual({ outcome: "response", status: 500, body: null });
  });

  test("servidor lento vira timeout, não erro genérico de rede", async () => {
    const result = await fetchJson(`${baseUrl}/devagar`, 80);

    expect(result).toEqual({ outcome: "timeout" });
  });

  test("host que não existe vira erro de rede", async () => {
    const result = await fetchJson("http://localhost:1/nada", 2000);

    expect(result).toEqual({ outcome: "network" });
  });
});
