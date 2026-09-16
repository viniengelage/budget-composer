import { Utils } from "electrobun/main";
import { mkdirSync } from "node:fs";
import { join } from "node:path";


import { openDatabase, type Db } from "@main/db/database";
import { migrate } from "@main/db/migrations";

const DATABASE_FILE = "orcamentos.db";

let instance: Db | null = null;

export function getDatabase(): Db {
  if (instance) return instance;

  const dataDir = Utils.paths.userData;
  mkdirSync(dataDir, { recursive: true });

  const db = openDatabase(join(dataDir, DATABASE_FILE));
  migrate(db);

  instance = db;
  return db;
}

export function databaseLocation(): string {
  return join(Utils.paths.userData, DATABASE_FILE);
}
