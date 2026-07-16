"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus2, Users, Package } from "lucide-react";
import { db } from "@/lib/db";

export default function Home() {
  const invoiceCount = useLiveQuery(() => db?.invoices.count() ?? 0, []) ?? 0;
  const customerCount = useLiveQuery(() => db?.customers.count() ?? 0, []) ?? 0;
  const productCount = useLiveQuery(() => db?.products.count() ?? 0, []) ?? 0;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-8 space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create a GST invoice in under 30 seconds.
          </p>
        </div>
        <Button
          render={<Link href="/invoices/new" />}
          nativeButton={false}
          size="lg"
          className="w-full sm:w-auto"
        >
          <FilePlus2 className="size-4" />
          New Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {invoiceCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {customerCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {productCount}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/invoices/new">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 pt-6">
              <FilePlus2 className="size-5 text-primary" />
              <div>
                <div className="font-medium">Create Invoice</div>
                <div className="text-xs text-muted-foreground">Ctrl+N</div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/customers/new">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 pt-6">
              <Users className="size-5 text-primary" />
              <div>
                <div className="font-medium">New Customer</div>
                <div className="text-xs text-muted-foreground">F2</div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/products/new">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 pt-6">
              <Package className="size-5 text-primary" />
              <div>
                <div className="font-medium">New Product</div>
                <div className="text-xs text-muted-foreground">F3</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
