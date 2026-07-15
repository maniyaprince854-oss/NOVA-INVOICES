import type { ItemTaxTypeValue, GstTaxModeValue } from "@/lib/schemas";

export interface InvoiceItemFormValue {
  productId: string;
  description: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  discountPercent: number;
  taxPercent: number;
  taxType: ItemTaxTypeValue;
}

export interface InvoiceFormValues {
  invoiceDate: string;
  dueDate: string;
  customerId: string;
  placeOfSupply: string;
  taxMode: GstTaxModeValue;
  poNumber: string;
  transportName: string;
  vehicleNumber: string;
  lrNumber: string;
  dispatchFrom: string;
  paymentMode: string;
  notes: string;
  salesPerson: string;
  status: string;
  freight: number;
  loadingCharges: number;
  packingCharges: number;
  otherCharges: number;
  invoiceDiscount: number;
  amountPaid: number;
  items: InvoiceItemFormValue[];
}

export function emptyItem(): InvoiceItemFormValue {
  return {
    productId: "",
    description: "",
    hsn: "",
    qty: 1,
    unit: "Pcs",
    rate: 0,
    discountPercent: 0,
    taxPercent: 18,
    taxType: "EXCLUSIVE",
  };
}

export function todayInputDate(): string {
  return new Date().toISOString().slice(0, 10);
}
