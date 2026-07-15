import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateInvoicePdf } from "@/lib/pdf/invoice-template";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true, customer: true, company: true },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let totalDue = invoice.balance;
  if (invoice.customerId) {
    const agg = await prisma.invoice.aggregate({
      where: { customerId: invoice.customerId, status: { not: "CANCELLED" } },
      _sum: { balance: true },
    });
    totalDue = agg._sum.balance ?? invoice.balance;
  }

  const pdfBytes = await generateInvoicePdf({ ...invoice, totalDue });
  const download = request.nextUrl.searchParams.get("download");

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}
