import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { companySchema } from "@/lib/schemas";

export async function GET() {
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "My Company",
        state: "Gujarat",
        invoicePrefix: "INV",
      },
    });
  }
  return NextResponse.json(company);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const parsed = companySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({ data: parsed.data });
  } else {
    company = await prisma.company.update({
      where: { id: company.id },
      data: parsed.data,
    });
  }

  return NextResponse.json(company);
}
