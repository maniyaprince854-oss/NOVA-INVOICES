import { prisma } from "@/lib/db";
import { InvoiceForm } from "@/components/invoice/invoice-form";

export default async function NewInvoicePage() {
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: { name: "My Company", state: "Gujarat", invoicePrefix: "INV" },
    });
  }

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
