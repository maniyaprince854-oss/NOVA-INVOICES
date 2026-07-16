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
import { Badge } from "@/components/ui/badge";
import { FilePlus2, Search } from "lucide-react";
import { listInvoices } from "@/lib/invoice-service";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PAID: "default",
  PARTIAL: "secondary",
  UNPAID: "outline",
  OVERDUE: "destructive",
  DRAFT: "secondary",
  CANCELLED: "destructive",
};

export default function InvoicesPage() {
  const [q, setQ] = useState("");
  const invoices = useLiveQuery(() => listInvoices(q), [q]) ?? [];

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {invoices.length} invoice{invoices.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          render={<Link href="/invoices/new" />}
          nativeButton={false}
          className="w-full sm:w-auto"
        >
          <FilePlus2 className="size-4" />
          New Invoice
        </Button>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search invoice #, customer, GSTIN, vehicle..."
          className="pl-8"
        />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Grand Total</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium">
                  <Link href={`/invoices/${inv.id}`} className="hover:underline">
                    {inv.invoiceNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  {new Date(inv.invoiceDate).toLocaleDateString("en-IN")}
                </TableCell>
                <TableCell>{inv.billToName}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[inv.status] ?? "outline"}>
                    {inv.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  ₹{inv.grandTotal.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-right">
                  ₹{inv.balance.toLocaleString("en-IN")}
                </TableCell>
              </TableRow>
            ))}
            {invoices.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No invoices yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
