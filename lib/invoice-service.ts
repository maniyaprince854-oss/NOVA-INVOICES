import { prisma } from "@/lib/db";
import { calcLineItem, calcInvoiceTotals, round2 } from "@/lib/invoice-calc";
import { nextInvoiceNumber } from "@/lib/invoice-number";
import { resolveSameState } from "@/lib/states";
import type { InvoiceInput } from "@/lib/schemas";
import type { InvoiceStatus, Prisma } from "@/lib/generated/prisma/client";

async function buildInvoiceData(input: InvoiceInput) {
  const company = await prisma.company.findFirstOrThrow();
  const customer = await prisma.customer.findUniqueOrThrow({
    where: { id: input.customerId },
  });

  const sameState = resolveSameState(
    input.taxMode,
    company.state,
    input.placeOfSupply
  );

  const lineResults = input.items.map((item) =>
    calcLineItem({
      qty: item.qty,
      rate: item.rate,
      discountPercent: item.discountPercent,
      taxPercent: item.taxPercent,
      taxType: item.taxType,
    })
  );

  const totals = calcInvoiceTotals(lineResults, sameState, {
    freight: input.freight,
    loadingCharges: input.loadingCharges,
    packingCharges: input.packingCharges,
    otherCharges: input.otherCharges,
    invoiceDiscount: input.invoiceDiscount,
  });

  const balance = round2(totals.grandTotal - input.amountPaid);

  let status: InvoiceStatus = input.status;
  if (status !== "DRAFT" && status !== "CANCELLED") {
    status =
      input.amountPaid <= 0 ? "UNPAID" : balance <= 0 ? "PAID" : "PARTIAL";
  }

  const itemsCreate: Prisma.InvoiceItemUncheckedCreateWithoutInvoiceInput[] =
    input.items.map((item, idx) => {
      const r = lineResults[idx];
      return {
        productId: item.productId || null,
        description: item.description,
        hsn: item.hsn,
        qty: item.qty,
        unit: item.unit,
        rate: item.rate,
        discountPercent: r.discountPercent,
        taxPercent: r.taxPercent,
        taxType: r.taxType,
        taxAmount: r.taxAmount,
        amount: r.amount,
        total: r.total,
        sortOrder: idx,
      };
    });

  const fields: Omit<
    Prisma.InvoiceUncheckedCreateInput,
    "invoiceNumber" | "companyId" | "items"
  > = {
    invoiceDate: input.invoiceDate,
    dueDate: input.dueDate ?? null,
    customerId: customer.id,
    billToName: customer.name,
    billToCompany: customer.companyName,
    billToAddress: customer.address,
    billToCity: customer.city,
    billToState: customer.state,
    billToPincode: customer.pincode,
    billToGstin: customer.gstin,
    billToPan: customer.pan,
    billToMobile: customer.mobile,
    placeOfSupply: input.placeOfSupply,
    taxMode: input.taxMode,
    poNumber: input.poNumber,
    transportName: input.transportName,
    vehicleNumber: input.vehicleNumber,
    lrNumber: input.lrNumber,
    dispatchFrom: input.dispatchFrom || company.name,
    paymentMode: input.paymentMode,
    notes: input.notes,
    salesPerson: input.salesPerson,
    status,
    subtotal: totals.subtotal,
    discountTotal: totals.discountTotal,
    freight: totals.freight,
    loadingCharges: totals.loadingCharges,
    packingCharges: totals.packingCharges,
    otherCharges: totals.otherCharges,
    cgstTotal: totals.cgstTotal,
    sgstTotal: totals.sgstTotal,
    igstTotal: totals.igstTotal,
    roundOff: totals.roundOff,
    grandTotal: totals.grandTotal,
    amountPaid: input.amountPaid,
    balance,
  };

  return { company, fields, itemsCreate };
}

export async function createInvoice(input: InvoiceInput) {
  const { company, fields, itemsCreate } = await buildInvoiceData(input);

  return prisma.$transaction(async (tx) => {
    const invoiceNumber = await nextInvoiceNumber(
      tx,
      company.id,
      input.invoiceDate
    );

    return tx.invoice.create({
      data: {
        invoiceNumber,
        companyId: company.id,
        ...fields,
        items: { create: itemsCreate },
      },
      include: { items: true, customer: true },
    });
  });
}

export async function updateInvoice(id: string, input: InvoiceInput) {
  const { fields, itemsCreate } = await buildInvoiceData(input);

  return prisma.$transaction(async (tx) => {
    await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
    return tx.invoice.update({
      where: { id },
      data: {
        ...fields,
        items: { create: itemsCreate },
      },
      include: { items: true, customer: true },
    });
  });
}
