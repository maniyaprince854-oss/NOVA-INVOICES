import { db } from "@/lib/db";
import { createId } from "@/lib/id";
import { calcLineItem, calcInvoiceTotals, round2 } from "@/lib/invoice-calc";
import { financialYearLabel } from "@/lib/invoice-number";
import { resolveSameState } from "@/lib/states";
import type { InvoiceInput } from "@/lib/schemas";
import type { Invoice, InvoiceItemRecord, InvoiceStatus } from "@/lib/types";

async function buildInvoice(
  input: InvoiceInput,
  existing?: Invoice
): Promise<Omit<Invoice, "id" | "invoiceNumber" | "createdAt">> {
  if (!db) throw new Error("Database not available");

  const company = await db.companies.toCollection().first();
  if (!company) throw new Error("Company profile not set up yet");

  const customer = await db.customers.get(input.customerId);
  if (!customer) throw new Error("Customer not found");

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

  const items: InvoiceItemRecord[] = input.items.map((item, idx) => {
    const r = lineResults[idx];
    return {
      id: existing?.items[idx]?.id ?? createId(),
      productId: item.productId || null,
      description: item.description,
      hsn: item.hsn || null,
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

  return {
    invoiceDate: input.invoiceDate,
    dueDate: input.dueDate ?? null,
    companyId: company.id,
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
    poNumber: input.poNumber ?? null,
    transportName: input.transportName ?? null,
    vehicleNumber: input.vehicleNumber ?? null,
    lrNumber: input.lrNumber ?? null,
    dispatchFrom: input.dispatchFrom || company.name,
    paymentMode: input.paymentMode ?? null,
    notes: input.notes ?? null,
    salesPerson: input.salesPerson ?? null,
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
    updatedAt: new Date(),
    items,
  };
}

export async function createInvoice(input: InvoiceInput): Promise<Invoice> {
  if (!db) throw new Error("Database not available");

  return db.transaction("rw", db.companies, db.customers, db.invoices, async () => {
    const fields = await buildInvoice(input);
    const company = await db!.companies.get(fields.companyId);
    if (!company) throw new Error("Company profile not set up yet");

    const seq = company.nextInvoiceSeq;
    await db!.companies.update(company.id, { nextInvoiceSeq: seq + 1 });
    const fy = financialYearLabel(input.invoiceDate, company.financialYearStart);
    const invoiceNumber = `${company.invoicePrefix}-${fy}-${seq}`;

    const invoice: Invoice = {
      id: createId(),
      invoiceNumber,
      createdAt: new Date(),
      ...fields,
    };
    await db!.invoices.add(invoice);
    return invoice;
  });
}

export async function updateInvoice(
  id: string,
  input: InvoiceInput
): Promise<Invoice> {
  if (!db) throw new Error("Database not available");

  return db.transaction("rw", db.companies, db.customers, db.invoices, async () => {
    const existing = await db!.invoices.get(id);
    if (!existing) throw new Error("Invoice not found");

    const fields = await buildInvoice(input, existing);
    const invoice: Invoice = {
      ...existing,
      ...fields,
    };
    await db!.invoices.put(invoice);
    return invoice;
  });
}

export async function listInvoices(query?: string): Promise<Invoice[]> {
  if (!db) return [];

  const all = await db.invoices.orderBy("invoiceDate").reverse().toArray();
  if (!query) return all.slice(0, 100);

  const q = query.trim().toLowerCase();
  return all
    .filter((inv) =>
      [
        inv.invoiceNumber,
        inv.billToName,
        inv.billToGstin,
        inv.billToMobile,
        inv.poNumber,
        inv.vehicleNumber,
      ]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    )
    .slice(0, 100);
}

export async function getInvoice(id: string): Promise<Invoice | undefined> {
  if (!db) return undefined;
  return db.invoices.get(id);
}

export async function deleteInvoice(id: string): Promise<void> {
  if (!db) return;
  await db.invoices.delete(id);
}

export async function setInvoiceStatus(
  id: string,
  status: InvoiceStatus
): Promise<Invoice> {
  if (!db) throw new Error("Database not available");
  const existing = await db.invoices.get(id);
  if (!existing) throw new Error("Invoice not found");
  const updated: Invoice = { ...existing, status, updatedAt: new Date() };
  await db.invoices.put(updated);
  return updated;
}

/** Sum of a customer's outstanding balance across all their non-cancelled invoices. */
export async function getCustomerTotalDue(customerId: string): Promise<number> {
  if (!db) return 0;
  const invoices = await db.invoices
    .where("customerId")
    .equals(customerId)
    .toArray();
  return round2(
    invoices
      .filter((inv) => inv.status !== "CANCELLED")
      .reduce((sum, inv) => sum + inv.balance, 0)
  );
}
