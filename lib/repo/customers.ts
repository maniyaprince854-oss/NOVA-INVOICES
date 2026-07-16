import { db } from "@/lib/db";
import { createId } from "@/lib/id";
import type { Customer } from "@/lib/types";
import type { CustomerInput } from "@/lib/schemas";

function normalize(input: CustomerInput): Omit<Customer, "id" | "createdAt" | "updatedAt"> {
  return {
    name: input.name,
    companyName: input.companyName ?? null,
    mobile: input.mobile ?? null,
    altMobile: input.altMobile ?? null,
    email: input.email ?? null,
    gstin: input.gstin ?? null,
    pan: input.pan ?? null,
    address: input.address ?? null,
    city: input.city ?? null,
    state: input.state,
    pincode: input.pincode ?? null,
    customerType: input.customerType,
    openingBalance: input.openingBalance,
    notes: input.notes ?? null,
    status: input.status,
  };
}

export async function listCustomers(query?: string): Promise<Customer[]> {
  if (!db) return [];

  const all = await db.customers.orderBy("createdAt").reverse().toArray();
  if (!query) return all.slice(0, 100);

  const q = query.trim().toLowerCase();
  return all
    .filter((c) =>
      [c.name, c.companyName, c.mobile, c.gstin, c.email]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    )
    .slice(0, 100);
}

export async function getCustomer(id: string): Promise<Customer | undefined> {
  if (!db) return undefined;
  return db.customers.get(id);
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  if (!db) throw new Error("Database not available");
  const now = new Date();
  const customer: Customer = {
    id: createId(),
    ...normalize(input),
    createdAt: now,
    updatedAt: now,
  };
  await db.customers.add(customer);
  return customer;
}

export async function updateCustomer(
  id: string,
  input: CustomerInput
): Promise<Customer> {
  if (!db) throw new Error("Database not available");
  const existing = await db.customers.get(id);
  if (!existing) throw new Error("Customer not found");
  const updated: Customer = {
    ...existing,
    ...normalize(input),
    updatedAt: new Date(),
  };
  await db.customers.put(updated);
  return updated;
}

export async function deleteCustomer(id: string): Promise<void> {
  if (!db) return;
  await db.customers.delete(id);
}
