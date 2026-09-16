/**
 * Configuração da aplicação.
 *
 * Não há backend próprio: o app é local-first. O único serviço externo é a
 * consulta pública de CNPJ.
 */
export const env = {
  /** BrasilAPI — consulta pública de CNPJ, sem chave de API. */
  cnpjApiUrl: "https://brasilapi.com.br/api/cnpj/v1",
  /** Timeout da consulta. Acima disso, a tela oferece preenchimento manual. */
  cnpjTimeoutMs: 8000,
  /** Espera após a última tecla antes de disparar a busca. */
  cnpjDebounceMs: 500,
} as const;
