import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

import type { Db } from "@main/db/database";

const PREFIX = "orcamentos-";
const SUFFIX = ".db";
const KEEP = 5;

function stamp(now: Date): string {
  return now.toISOString().replace(/[:.]/g, "-").replace("Z", "");
}

/**
 * Copia o banco usando `VACUUM INTO`, e não cópia de arquivo. Com WAL ligado,
 * copiar só o `.db` deixa para trás as transações que ainda estão no `-wal`:
 * o backup abriria sem erro e com dados faltando, que é a pior forma de perder
 * dado — a que não avisa.
 *
 * `VACUUM INTO` gera um arquivo único e consistente, sem travar o banco.
 */
export function backupDatabase(db: Db, directory: string, now = new Date()): string {
  mkdirSync(directory, { recursive: true });

  const target = join(directory, `${PREFIX}${stamp(now)}${SUFFIX}`);

  // O caminho não pode ser parâmetro em VACUUM INTO; aspas simples dobradas
  // é o escape do SQLite.
  db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);

  pruneOldBackups(directory);
  return target;
}

export function listBackups(directory: string): string[] {
  try {
    return readdirSync(directory)
      .filter((name) => name.startsWith(PREFIX) && name.endsWith(SUFFIX))
      .sort();
  } catch {
    return [];
  }
}

function pruneOldBackups(directory: string): void {
  const backups = listBackups(directory);
  if (backups.length <= KEEP) return;

  for (const name of backups.slice(0, backups.length - KEEP)) {
    rmSync(join(directory, name), { force: true });
  }
}
