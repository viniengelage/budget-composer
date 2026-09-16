import { NativeModules, TurboModuleRegistry, type TurboModule } from "react-native";

/**
 * Ponte JS para o módulo nativo de SQLite do React Native Windows.
 *
 * CONTRATO
 *
 * 1. Handles numéricos em vez de objetos. Devolver um objeto com métodos
 *    exigiria HostObject/JSI e muito mais C++ para manter.
 *
 * 2. Parâmetros e resultados trafegam como valores estruturados. O RNW
 *    converte `JSValueArray`/`JSValueObject` automaticamente, então o C++ não
 *    precisa de um parser JSON — código que eu não teria como testar.
 *
 * 3. Tudo assíncrono: SQLite em disco não pode bloquear a thread de JS.
 *
 * LOCALIZAÇÃO DO MÓDULO
 * `TurboModuleRegistry` primeiro, `NativeModules` como reserva. Na nova
 * arquitetura do RNW um módulo atribuído (`REACT_MODULE`) costuma aparecer
 * nos dois registros, mas isso varia por versão. Cinco linhas de reserva
 * custam menos que um ciclo de build no Windows para descobrir qual é.
 */

export type SqlParam = string | number | null;

export interface ExecuteResultRaw {
  rowsAffected: number;
  insertId: number | null;
}

export interface RnwSqliteModule extends TurboModule {
  open(name: string): Promise<number>;
  close(handle: number): Promise<void>;
  execute(handle: number, sql: string, params: SqlParam[]): Promise<ExecuteResultRaw>;
  query(
    handle: number,
    sql: string,
    params: SqlParam[],
  ): Promise<Record<string, unknown>[]>;
}

const MODULE_NAME = "RnwSqlite";

function locate(): RnwSqliteModule | null {
  const turbo = TurboModuleRegistry.get<RnwSqliteModule>(MODULE_NAME);
  if (turbo) return turbo;

  const legacy = (NativeModules as Record<string, unknown>)[MODULE_NAME];
  return (legacy as RnwSqliteModule | undefined) ?? null;
}

export const NativeRnwSqlite: RnwSqliteModule | null = locate();
