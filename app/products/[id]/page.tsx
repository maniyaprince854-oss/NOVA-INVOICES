"use client";

import { useParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { getProduct } from "@/lib/repo/products";
import { ProductForm } from "@/components/products/product-form";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = useLiveQuery(() => getProduct(id), [id]);

  if (product === undefined) return null;
  if (!product) {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {product.name}
        </h1>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
