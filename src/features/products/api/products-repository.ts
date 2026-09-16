import { createCollection, createId } from "@/lib/storage/collection";
import type { Product } from "@/types";

const collection = createCollection<Product>("products");

export const productsRepository = {
  list: collection.list,
  findById: collection.findById,
  remove: collection.remove,

  async create(draft: Omit<Product, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    return collection.save({ ...draft, id: createId(), createdAt: now, updatedAt: now });
  },

  async update(product: Product) {
    return collection.save({ ...product, updatedAt: new Date().toISOString() });
  },
};
