import { NativeModules, TurboModuleRegistry, type TurboModule } from "react-native";

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
