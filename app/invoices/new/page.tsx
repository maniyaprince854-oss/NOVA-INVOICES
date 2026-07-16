"use client";

import { useEffect, useState } from "react";
import { getOrCreateCompany } from "@/lib/repo/company";
import { InvoiceForm } from "@/components/invoice/invoice-form";
import type { Company } from "@/lib/types";

export default function NewInvoicePage() {
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    getOrCreateCompany().then(setCompany);
  }, []);

  if (!company) return null;

  return (
    <div className="mx-auto max-w-[1600px] p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">New Invoice</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Select a customer, add items, and save.
        </p>
      </div>
      <InvoiceForm company={company} />
    </div>
  );
}
