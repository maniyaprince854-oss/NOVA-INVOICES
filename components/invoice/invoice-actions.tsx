"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, Pencil, Printer, Ban } from "lucide-react";

export function InvoiceActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();

  async function cancelInvoice() {
    if (!confirm("Cancel this invoice? This cannot be undone.")) return;
    const res = await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    if (!res.ok) {
      toast.error("Failed to cancel invoice");
      return;
    }
    toast.success("Invoice cancelled");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        nativeButton={false}
        render={
          <a href={`/api/invoices/${id}/pdf`} target="_blank" rel="noreferrer" />
        }
      >
        <Printer className="size-4" />
        Print
      </Button>
      <Button
        variant="outline"
        nativeButton={false}
        render={<a href={`/api/invoices/${id}/pdf?download=1`} />}
      >
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
