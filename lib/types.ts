export type TaxType = "EXCLUSIVE" | "INCLUSIVE";

export type ItemTaxType =
  | "EXCLUSIVE"
  | "INCLUSIVE"
  | "EXEMPT"
  | "ZERO_RATED"
  | "NIL_RATED"
  | "REVERSE_CHARGE";

export type GstTaxMode = "AUTO" | "CGST_SGST" | "IGST";

export type CustomerType = "RETAIL" | "WHOLESALE" | "DEALER" | "DISTRIBUTOR";

export type PaymentMode =
  | "CASH"
  | "UPI"
  | "CHEQUE"
  | "NEFT"
  | "RTGS"
  | "IMPS"
  | "BANK_TRANSFER"
  | "CREDIT";

export type InvoiceStatus =
  | "DRAFT"
  | "UNPAID"
  | "PARTIAL"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export interface Company {
  id: string;
  name: string;
  logoUrl: string | null;
  gstin: string | null;
  pan: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  bankName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  ifsc: string | null;
  branch: string | null;
  invoicePrefix: string;
  nextInvoiceSeq: number;
  financialYearStart: number;
  termsAndConditions: string | null;
  signatureUrl: string | null;
  defaultTaxType: TaxType;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  companyName: string | null;
  mobile: string | null;
  altMobile: string | null;
  email: string | null;
  gstin: string | null;
  pan: string | null;
  address: string | null;
  city: string | null;
  state: string;
  pincode: string | null;
  customerType: CustomerType;
  openingBalance: number;
  notes: string | null;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  hsn: string | null;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  gstPercent: number;
  taxType: ItemTaxType;
  stock: number;
  category: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItemRecord {
  id: string;
  productId: string | null;
  description: string;
  hsn: string | null;
  qty: number;
  unit: string;
  rate: number;
  discountPercent: number;
  taxPercent: number;
  taxType: ItemTaxType;
  taxAmount: number;
  amount: number;
  total: number;
  sortOrder: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date | null;
  companyId: string;
  customerId: string | null;

  // Snapshot of customer/billing details at time of invoicing
  billToName: string;
  billToCompany: string | null;
  billToAddress: string | null;
  billToCity: string | null;
  billToState: string;
  billToPincode: string | null;
  billToGstin: string | null;
  billToPan: string | null;
  billToMobile: string | null;

  placeOfSupply: string;
  taxMode: GstTaxMode;
  poNumber: string | null;
  transportName: string | null;
  vehicleNumber: string | null;
  lrNumber: string | null;
  dispatchFrom: string | null;

  paymentMode: PaymentMode | null;
  notes: string | null;
  salesPerson: string | null;

  status: InvoiceStatus;

  subtotal: number;
  discountTotal: number;
  freight: number;
  loadingCharges: number;
  packingCharges: number;
  otherCharges: number;

  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;

  roundOff: number;
  grandTotal: number;
  amountPaid: number;
  balance: number;

  createdAt: Date;
  updatedAt: Date;

  items: InvoiceItemRecord[];
}
