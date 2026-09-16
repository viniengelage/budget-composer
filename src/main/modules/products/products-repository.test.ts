import { beforeEach, describe, expect, test } from "bun:test";

import { openDatabase, type Db } from "@main/db/database";
import { migrate } from "@main/db/migrations";
import {
  archiveProduct,
  createProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "@main/modules/products/products-repository";

let db: Db;

beforeEach(() => {
  db = openDatabase(":memory:");
  migrate(db);
});

const GRAMA = {
  name: "Grama esmeralda",
  description: "Placa de grama, medida por metro quadrado",
  unit: "m2" as const,
  unitPrice: 1250,
};

describe("produtos", () => {
  test("cria e lê de volta com o preço em centavos", () => {
    const created = createProduct(db, GRAMA);

    expect(created.id).toBeString();
    expect(created.unitPrice).toBe(1250);
    expect(getProduct(db, created.id)?.name).toBe("Grama esmeralda");
  });

  test("lista em ordem alfabética ignorando maiúsculas", () => {
    createProduct(db, { ...GRAMA, name: "areia" });
    createProduct(db, { ...GRAMA, name: "Adubo" });
    createProduct(db, { ...GRAMA, name: "Brita" });

    expect(listProducts(db).map((product) => product.name)).toEqual([
      "Adubo",
      "areia",
      "Brita",
    ]);
  });

  test("busca por nome e por descrição", () => {
    createProduct(db, GRAMA);
    createProduct(db, { ...GRAMA, name: "Adubo", description: "Saco de 20kg" });

    expect(listProducts(db, "grama")).toHaveLength(1);
    expect(listProducts(db, "20kg")[0]?.name).toBe("Adubo");
    expect(listProducts(db, "inexistente")).toHaveLength(0);
  });

  test("busca aceita apóstrofo sem quebrar a consulta", () => {
    createProduct(db, { ...GRAMA, name: "Grama D'Ávila" });

    expect(listProducts(db, "D'Ávila")).toHaveLength(1);
  });

  test("atualiza o preço", () => {
    const created = createProduct(db, GRAMA);
    const updated = updateProduct(db, created.id, { ...GRAMA, unitPrice: 1390 });

    expect(updated.unitPrice).toBe(1390);
  });

  test("produto arquivado some da lista mas continua acessível por id", () => {
    const created = createProduct(db, GRAMA);
    archiveProduct(db, created.id);

    expect(listProducts(db)).toHaveLength(0);
    expect(getProduct(db, created.id)?.name).toBe("Grama esmeralda");
  });

  test("arquivar duas vezes avisa em vez de falhar em silêncio", () => {
    const created = createProduct(db, GRAMA);
    archiveProduct(db, created.id);

    expect(() => archiveProduct(db, created.id)).toThrow(/já foi removido/);
  });

  test("atualizar produto inexistente avisa", () => {
    expect(() => updateProduct(db, "nao-existe", GRAMA)).toThrow(/não existe/);
  });
});
