import { createCollection, createId } from "@/lib/storage/collection";
import { storage } from "@/lib/storage/storage";
import type { Quote } from "@/types";

const collection = createCollection<Quote>("quotes");
const COUNTER_KEY = "quotes:last-number";

async function nextNumber(): Promise<number> {
  const last = (await storage.get<number>(COUNTER_KEY)) ?? 0;
  const next = last + 1;
  await storage.set(COUNTER_KEY, next);
  return next;
}

export const quotesRepository = {
  list: collection.list,
  findById: collection.findById,
  remove: collection.remove,

  async create(draft: Omit<Quote, "id" | "number" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();

    return collection.save({
      ...draft,
      id: createId(),
      number: await nextNumber(),
      createdAt: now,
      updatedAt: now,
    });
  },

  async update(quote: Quote) {
    return collection.save({ ...quote, updatedAt: new Date().toISOString() });
  },

  async setLastNumber(value: number) {
    await storage.set(COUNTER_KEY, value);
  },
};
