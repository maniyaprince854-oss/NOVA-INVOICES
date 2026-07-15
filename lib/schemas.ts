import { z } from "zod";

export const itemTaxTypeEnum = z.enum([
  "EXCLUSIVE",
  "INCLUSIVE",
  "EXEMPT",
  "ZERO_RATED",
  "NIL_RATED",
  "REVERSE_CHARGE",
]);
export type ItemTaxTypeValue = z.infer<typeof itemTaxTypeEnum>;

export const gstTaxModeEnum = z.enum(["AUTO", "CGST_SGST", "IGST"]);
export type GstTaxModeValue = z.infer<typeof gstTaxModeEnum>;

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  logoUrl: z.string().optional().nullable(),
  gstin: z.string().optional().nullable(),
  pan: z.string().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().min(1, "State is required"),
  pincode: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  website: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  accountName: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  ifsc: z.string().optional().nullable(),
  branch: z.string().optional().nullable(),
  invoicePrefix: z.string().min(1, "Invoice prefix is required"),
  financialYearStart: z.number().int().min(1).max(12),
  termsAndConditions: z.string().optional().nullable(),
  signatureUrl: z.string().optional().nullable(),
  defaultTaxType: z.enum(["EXCLUSIVE", "INCLUSIVE"]),
});
export type CompanyInput = z.infer<typeof companySchema>;

export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  companyName: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  altMobile: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  gstin: z.string().optional().nullable(),
  pan: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().min(1, "State is required"),
  pincode: z.string().optional().nullable(),
  customerType: z.enum(["RETAIL", "WHOLESALE", "DEALER", "DISTRIBUTOR"]),
  openingBalance: z.number(),
  notes: z.string().optional().nullable(),
  status: z.boolean(),
});
export type CustomerInput = z.infer<typeof customerSchema>;

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  hsn: z.string().optional().nullable(),
  unit: z.string().min(1, "Unit is required"),
  purchasePrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  gstPercent: z.number().min(0).max(100),
  taxType: itemTaxTypeEnum,
  stock: z.number(),
  category: z.string().optional().nullable(),
  active: z.boolean(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const invoiceItemSchema = z.object({
  productId: z.string().optional().nullable(),
  description: z.string().min(1),
  hsn: z.string().optional().nullable(),
  qty: z.coerce.number().positive("Qty must be greater than 0"),
  unit: z.string().min(1),
  rate: z.coerce.number().min(0),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  taxPercent: z.coerce.number().min(0).max(100),
  taxType: itemTaxTypeEnum.default("EXCLUSIVE"),
});
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;

export const invoiceSchema = z.object({
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional().nullable(),
  customerId: z.string().min(1, "Select a customer"),
  placeOfSupply: z.string().min(1, "Place of supply is required"),
  taxMode: gstTaxModeEnum.default("AUTO"),
  poNumber: z.string().optional().nullable(),
  transportName: z.string().optional().nullable(),
  vehicleNumber: z.string().optional().nullable(),
  lrNumber: z.string().optional().nullable(),
  dispatchFrom: z.string().optional().nullable(),
  paymentMode: z
    .enum([
      "CASH",
      "UPI",
      "CHEQUE",
      "NEFT",
      "RTGS",
      "IMPS",
      "BANK_TRANSFER",
      "CREDIT",
    ])
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
  salesPerson: z.string().optional().nullable(),
  status: z
    .enum(["DRAFT", "UNPAID", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"])
    .default("UNPAID"),
  freight: z.coerce.number().min(0).default(0),
  loadingCharges: z.coerce.number().min(0).default(0),
  packingCharges: z.coerce.number().min(0).default(0),
  otherCharges: z.coerce.number().min(0).default(0),
  invoiceDiscount: z.coerce.number().min(0).default(0),
  amountPaid: z.coerce.number().min(0).default(0),
  items: z.array(invoiceItemSchema).min(1, "Add at least one item"),
});
export type InvoiceInput = z.infer<typeof invoiceSchema>;
