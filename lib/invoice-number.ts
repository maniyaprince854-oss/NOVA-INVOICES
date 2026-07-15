import type { Prisma, PrismaClient } from "@/lib/generated/prisma/client";

type TxClient = PrismaClient | Prisma.TransactionClient;

export function financialYearLabel(date: Date, fyStartMonth = 4): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12

  const startYear = month >= fyStartMonth ? year : year - 1;
  const endYearShort = String((startYear + 1) % 100).padStart(2, "0");

  return `${startYear}-${endYearShort}`;
}

/**
 * Atomically claims the next invoice number for a company, incrementing its
 * sequence counter. Must be called with a Prisma transaction client so the
 * increment and the invoice insert commit together.
 */
export async function nextInvoiceNumber(
  tx: TxClient,
  companyId: string,
  invoiceDate: Date
): Promise<string> {
  const company = await tx.company.findUniqueOrThrow({
    where: { id: companyId },
  });

  const seq = company.nextInvoiceSeq;
  await tx.company.update({
    where: { id: companyId },
    data: { nextInvoiceSeq: seq + 1 },
  });

  const fy = financialYearLabel(invoiceDate, company.financialYearStart);
  return `${company.invoicePrefix}-${fy}-${seq}`;
}
