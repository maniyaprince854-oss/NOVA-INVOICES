"use client";

import { useParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { getInvoice } from "@/lib/invoice-service";
import { getCustomer } from "@/lib/repo/customers";
import { InvoiceForm } from "@/components/invoice/invoice-form";

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();

  const invoice = useLiveQuery(() => getInvoice(id), [id]);
  const company = useLiveQuery(() => db?.companies.toCollection().first(), []);
  const customer = useLiveQuery(
    () => (invoice?.customerId ? getCustomer(invoice.customerId) : undefined),
    [invoice?.customerId]
  );

  if (invoice === undefined || company === undefined) return null;
  if (!invoice || !company) {
    return (
      <div className="mx-auto max-w-[1600px] p-4 sm:p-8">
        <p className="text-muted-foreground">Invoice not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit Invoice {invoice.invoiceNumber}
        </h1>
      </div>
      <InvoiceForm company={company} invoice={invoice} initialCustomer={customer ?? null} />
    </div>
  );
}
