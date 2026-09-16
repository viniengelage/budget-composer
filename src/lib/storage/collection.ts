import { storage } from "@/lib/storage/storage";

interface Entity {
  id: string;
}

export interface Collection<T extends Entity> {
  list(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  remove(id: string): Promise<void>;
  replaceAll(entities: T[]): Promise<void>;
}

/**
 * Coleção persistida em uma única chave.
 *
 * Adequado à escala deste app (centenas de registros, um usuário, uma
 * máquina). Se o volume crescer a ponto de reescrever o array inteiro doer,
 * a troca por SQLite acontece aqui dentro, sem tocar nas features.
 */
export function createCollection<T extends Entity>(key: string): Collection<T> {
  async function list(): Promise<T[]> {
    return (await storage.get<T[]>(key)) ?? [];
  }

  return {
    list,

    async findById(id) {
      const all = await list();
      return all.find((entity) => entity.id === id) ?? null;
    },

    async save(entity) {
      const all = await list();
      const index = all.findIndex((candidate) => candidate.id === entity.id);

      if (index === -1) {
        all.push(entity);
      } else {
        all[index] = entity;
      }

      await storage.set(key, all);
      return entity;
    },

    async remove(id) {
      const all = await list();
      await storage.set(
        key,
        all.filter((entity) => entity.id !== id),
      );
    },

    async replaceAll(entities) {
      await storage.set(key, entities);
    },
  };
}

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
