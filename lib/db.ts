import Dexie, { type EntityTable } from "dexie";
import type { Company, Customer, Product, Invoice } from "@/lib/types";

class NovaInvoicesDB extends Dexie {
  companies!: EntityTable<Company, "id">;
  customers!: EntityTable<Customer, "id">;
  products!: EntityTable<Product, "id">;
  invoices!: EntityTable<Invoice, "id">;

  constructor() {
    super("NovaInvoicesDB");
    this.version(1).stores({
      companies: "id",
      customers: "id, name, mobile, gstin, createdAt",
      products: "id, name, hsn, createdAt",
      invoices: "id, invoiceNumber, invoiceDate, customerId, status",
    });
  }
}

/**
 * IndexedDB only exists in the browser. This module is imported by client
 * components that also run once during Next.js's server-side render pass,
 * so `db` is null there — every caller must handle that (return an empty
 * default). On the client the real Dexie instance takes over after the
 * first render/hydration.
 */
export const db: NovaInvoicesDB | null =
  typeof window !== "undefined" ? new NovaInvoicesDB() : null;
