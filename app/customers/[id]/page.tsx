"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { getCustomer } from "@/lib/repo/customers";
import { CustomerForm } from "@/components/customers/customer-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();

  const customer = useLiveQuery(() => getCustomer(id), [id]);
  const invoices =
    useLiveQuery(
      () =>
        db?.invoices
          .where("customerId")
          .equals(id)
          .reverse()
          .sortBy("invoiceDate") ?? [],
      [id]
    ) ?? [];

  if (customer === undefined) return null;
  if (!customer) {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <p className="text-muted-foreground">Customer not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8 space-y-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {customer.name}
        </h1>
      </div>
      <CustomerForm customer={customer} />

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {invoices.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No invoices yet for this customer.
            </p>
          )}
          {invoices.slice(0, 20).map((inv) => (
            <Link
              key={inv.id}
              href={`/invoices/${inv.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm hover:bg-accent"
            >
              <div>
                <div className="font-medium">{inv.invoiceNumber}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(inv.invoiceDate).toLocaleDateString("en-IN")}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{inv.status}</Badge>
                <span className="font-medium">
                  ₹{inv.grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
