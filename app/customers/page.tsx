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
import { UserPlus, Search } from "lucide-react";
import { listCustomers } from "@/lib/repo/customers";

export default function CustomersPage() {
  const [q, setQ] = useState("");
  const customers = useLiveQuery(() => listCustomers(q), [q]) ?? [];

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {customers.length} customer{customers.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          render={<Link href="/customers/new" />}
          nativeButton={false}
          className="w-full sm:w-auto"
        >
          <UserPlus className="size-4" />
          New Customer
        </Button>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, mobile, GSTIN..."
          className="pl-8"
        />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>City / State</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>GSTIN</TableHead>
              <TableHead className="text-right">Opening Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id} className="cursor-pointer">
                <TableCell className="font-medium">
                  <Link href={`/customers/${c.id}`} className="hover:underline">
                    {c.name}
                  </Link>
                  {c.companyName && (
                    <div className="text-xs text-muted-foreground">
                      {c.companyName}
                    </div>
                  )}
                </TableCell>
                <TableCell>{c.mobile ?? "—"}</TableCell>
                <TableCell>
                  {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{c.customerType}</Badge>
                </TableCell>
                <TableCell>{c.gstin ?? "—"}</TableCell>
                <TableCell className="text-right">
                  ₹{c.openingBalance.toLocaleString("en-IN")}
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No customers yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
