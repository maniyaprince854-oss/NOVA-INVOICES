import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { InvoiceForm } from "@/components/invoice/invoice-form";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [invoice, company] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: { items: true, customer: true },
    }),
    prisma.company.findFirstOrThrow(),
  ]);

  if (!invoice) notFound();

  return (
    <div className="mx-auto max-w-[1600px] p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit Invoice {invoice.invoiceNumber}
        </h1>
      </div>
      <InvoiceForm company={company} invoice={invoice} />
    </div>
  );
}
