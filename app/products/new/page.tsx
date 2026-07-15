import { ProductForm } from "@/components/products/product-form";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">New Product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
