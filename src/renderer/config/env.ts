/**
 * A URL e o timeout da BrasilAPI ficam em `src/main/config/env.ts`: a consulta
 * de CNPJ sai do processo principal, não da webview. Aqui sobra só o que é
 * comportamento de tela.
 */
export const env = {
  /** Espera a pessoa parar de digitar antes de consultar o CNPJ. */
  cnpjDebounceMs: 500,
} as const;
