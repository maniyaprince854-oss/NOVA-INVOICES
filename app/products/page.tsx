"use client";

import { useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PackagePlus, Search } from "lucide-react";
import { listProducts } from "@/lib/repo/products";

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const products = useLiveQuery(() => listProducts(q), [q]) ?? [];

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          render={<Link href="/products/new" />}
          nativeButton={false}
          className="w-full sm:w-auto"
        >
          <PackagePlus className="size-4" />
          New Product
        </Button>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, HSN, category..."
          className="pl-8"
        />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>HSN</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">GST %</TableHead>
              <TableHead className="text-right">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  <Link href={`/products/${p.id}`} className="hover:underline">
                    {p.name}
                  </Link>
                  {p.category && (
                    <div className="text-xs text-muted-foreground">
                      {p.category}
                    </div>
                  )}
                </TableCell>
                <TableCell>{p.hsn ?? "—"}</TableCell>
                <TableCell>{p.unit}</TableCell>
                <TableCell className="text-right">
                  ₹{p.sellingPrice.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-right">{p.gstPercent}%</TableCell>
                <TableCell className="text-right">{p.stock}</TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No products yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
