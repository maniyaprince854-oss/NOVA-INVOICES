import { db } from "@/lib/db";
import { createId } from "@/lib/id";
import type { Product } from "@/lib/types";
import type { ProductInput } from "@/lib/schemas";

function normalize(input: ProductInput): Omit<Product, "id" | "createdAt" | "updatedAt"> {
  return {
    name: input.name,
    hsn: input.hsn ?? null,
    unit: input.unit,
    purchasePrice: input.purchasePrice,
    sellingPrice: input.sellingPrice,
    gstPercent: input.gstPercent,
    taxType: input.taxType,
    stock: input.stock,
    category: input.category ?? null,
    active: input.active,
  };
}

export async function listProducts(query?: string): Promise<Product[]> {
  if (!db) return [];

  const all = await db.products.orderBy("createdAt").reverse().toArray();
  if (!query) return all.slice(0, 100);

  const q = query.trim().toLowerCase();
  return all
    .filter((p) =>
      [p.name, p.hsn, p.category]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    )
    .slice(0, 100);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  if (!db) return undefined;
  return db.products.get(id);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  if (!db) throw new Error("Database not available");
  const now = new Date();
  const product: Product = {
    id: createId(),
    ...normalize(input),
    createdAt: now,
    updatedAt: now,
  };
  await db.products.add(product);
  return product;
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<Product> {
  if (!db) throw new Error("Database not available");
  const existing = await db.products.get(id);
  if (!existing) throw new Error("Product not found");
  const updated: Product = {
    ...existing,
    ...normalize(input),
    updatedAt: new Date(),
  };
  await db.products.put(updated);
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  if (!db) return;
  await db.products.delete(id);
}
