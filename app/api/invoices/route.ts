import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { invoiceSchema } from "@/lib/schemas";
import { createInvoice } from "@/lib/invoice-service";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  const invoices = await prisma.invoice.findMany({
    where: q
      ? {
          OR: [
            { invoiceNumber: { contains: q } },
            { billToName: { contains: q } },
            { billToGstin: { contains: q } },
            { billToMobile: { contains: q } },
            { poNumber: { contains: q } },
            { vehicleNumber: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { invoiceDate: "desc" },
    take: 100,
    include: { customer: true },
  });

  return NextResponse.json(invoices);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const invoice = await createInvoice(parsed.data);
    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
