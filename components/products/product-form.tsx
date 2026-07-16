"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { productSchema, type ProductInput } from "@/lib/schemas";
import type { Product } from "@/lib/types";
import { createProduct, updateProduct } from "@/lib/repo/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TAX_TYPE_ITEMS: Record<string, string> = {
  EXCLUSIVE: "GST Exclusive",
  INCLUSIVE: "GST Inclusive",
  EXEMPT: "GST Exempt",
  ZERO_RATED: "Zero Rated",
  NIL_RATED: "Nil Rated",
  REVERSE_CHARGE: "Reverse Charge",
};

function toFormValues(product?: Product): ProductInput {
  return {
    name: product?.name ?? "",
    hsn: product?.hsn ?? "",
    unit: product?.unit ?? "Pcs",
    purchasePrice: product?.purchasePrice ?? 0,
    sellingPrice: product?.sellingPrice ?? 0,
    gstPercent: product?.gstPercent ?? 18,
    taxType: product?.taxType ?? "EXCLUSIVE",
    stock: product?.stock ?? 0,
    category: product?.category ?? "",
    active: product?.active ?? true,
  };
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: toFormValues(product),
  });
  const { register, handleSubmit, control, setValue, formState } = form;
  const taxType = useWatch({ control, name: "taxType" });

  async function onSubmit(values: ProductInput) {
    try {
      if (product) {
        await updateProduct(product.id, values);
        toast.success("Product updated");
      } else {
        await createProduct(values);
        toast.success("Product created");
      }
      router.push("/products");
    } catch {
      toast.error("Failed to save product");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" autoFocus {...register("name")} />
            {formState.errors.name && (
              <p className="text-xs text-destructive">
                {formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hsn">HSN Code</Label>
            <Input id="hsn" {...register("hsn")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Input id="category" {...register("category")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unit">Unit</Label>
            <Input id="unit" {...register("unit")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gstPercent">GST %</Label>
            <Input
              id="gstPercent"
              type="number"
              step="0.01"
              {...register("gstPercent", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tax Type</Label>
            <Select
              items={TAX_TYPE_ITEMS}
              value={taxType}
              onValueChange={(v) =>
                setValue("taxType", (v ?? "EXCLUSIVE") as ProductInput["taxType"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXCLUSIVE">GST Exclusive</SelectItem>
                <SelectItem value="INCLUSIVE">GST Inclusive</SelectItem>
                <SelectItem value="EXEMPT">GST Exempt</SelectItem>
                <SelectItem value="ZERO_RATED">Zero Rated</SelectItem>
                <SelectItem value="NIL_RATED">Nil Rated</SelectItem>
                <SelectItem value="REVERSE_CHARGE">Reverse Charge</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="purchasePrice">Purchase Price</Label>
            <Input
              id="purchasePrice"
              type="number"
              step="0.01"
              {...register("purchasePrice", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sellingPrice">Selling Price</Label>
            <Input
              id="sellingPrice"
              type="number"
              step="0.01"
              {...register("sellingPrice", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              step="0.01"
              {...register("stock", { valueAsNumber: true })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/products")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={formState.isSubmitting}>
          {product ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
