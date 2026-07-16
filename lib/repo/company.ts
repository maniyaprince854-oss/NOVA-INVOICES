import { db } from "@/lib/db";
import { createId } from "@/lib/id";
import type { Company } from "@/lib/types";
import type { CompanyInput } from "@/lib/schemas";

function defaultCompany(): Company {
  const now = new Date();
  return {
    id: createId(),
    name: "My Company",
    logoUrl: null,
    gstin: null,
    pan: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    state: "Gujarat",
    pincode: null,
    phone: null,
    email: null,
    website: null,
    bankName: null,
    accountName: null,
    accountNumber: null,
    ifsc: null,
    branch: null,
    invoicePrefix: "INV",
    nextInvoiceSeq: 1,
    financialYearStart: 4,
    termsAndConditions: null,
    signatureUrl: null,
    defaultTaxType: "EXCLUSIVE",
    createdAt: now,
    updatedAt: now,
  };
}

/** Returns the single company profile, creating a default one on first use. */
export async function getOrCreateCompany(): Promise<Company> {
  if (!db) return defaultCompany();

  const existing = await db.companies.toCollection().first();
  if (existing) return existing;

  const created = defaultCompany();
  await db.companies.add(created);
  return created;
}

export async function updateCompany(input: CompanyInput): Promise<Company> {
  if (!db) throw new Error("Database not available");

  const existing = await db.companies.toCollection().first();
  const now = new Date();

  if (!existing) {
    const created: Company = {
      ...defaultCompany(),
      ...input,
      nextInvoiceSeq: 1,
      createdAt: now,
      updatedAt: now,
    };
    await db.companies.add(created);
    return created;
  }

  const updated: Company = {
    ...existing,
    ...input,
    updatedAt: now,
  };
  await db.companies.put(updated);
  return updated;
}
