"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, Pencil, Printer, Ban } from "lucide-react";
import { db } from "@/lib/db";
import { getInvoice, getCustomerTotalDue, setInvoiceStatus } from "@/lib/invoice-service";
import { generateInvoicePdf } from "@/lib/pdf/invoice-template";

export function InvoiceActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  async function cancelInvoice() {
    if (!confirm("Cancel this invoice? This cannot be undone.")) return;
    try {
      await setInvoiceStatus(id, "CANCELLED");
      toast.success("Invoice cancelled");
    } catch {
      toast.error("Failed to cancel invoice");
    }
  }

  async function buildPdfBlob(): Promise<Blob | null> {
    const invoice = await getInvoice(id);
    if (!invoice) {
      toast.error("Invoice not found");
      return null;
    }
    const company = await db?.companies.toCollection().first();
    if (!company) {
      toast.error("Company profile not set up yet");
      return null;
    }
    const totalDue = invoice.customerId
      ? await getCustomerTotalDue(invoice.customerId)
      : invoice.balance;

    const bytes = await generateInvoicePdf({ ...invoice, company, totalDue });
    return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  }

  async function handlePrint() {
    const blob = await buildPdfBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noreferrer");
  }

  async function handleDownload() {
    const blob = await buildPdfBlob();
    if (!blob) return;
    const invoice = await getInvoice(id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoice?.invoiceNumber ?? "invoice"}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="size-4" />
        Print
      </Button>
      <Button variant="outline" onClick={handleDownload}>
        <Download className="size-4" />
        Download PDF
      </Button>
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href={`/invoices/${id}/edit`} />}
      >
        <Pencil className="size-4" />
        Edit
      </Button>
      {status !== "CANCELLED" && (
        <Button variant="outline" onClick={cancelInvoice}>
          <Ban className="size-4" />
          Cancel
        </Button>
      )}
    </div>
  );
}
