/**
 * EXCLUSIVE/INCLUSIVE change how tax is derived from the entered rate.
 * EXEMPT/ZERO_RATED/NIL_RATED/REVERSE_CHARGE all collect zero tax on the
 * invoice (for different legal reasons under GST) so they compute
 * identically, but are kept distinct for reporting/labeling.
 */
export type ItemTaxType =
  | "EXCLUSIVE"
  | "INCLUSIVE"
  | "EXEMPT"
  | "ZERO_RATED"
  | "NIL_RATED"
  | "REVERSE_CHARGE";

const NO_TAX_TYPES: ReadonlySet<ItemTaxType> = new Set([
  "EXEMPT",
  "ZERO_RATED",
  "NIL_RATED",
  "REVERSE_CHARGE",
]);

export interface LineItemInput {
  qty: number;
  rate: number;
  discountPercent?: number;
  taxPercent: number;
  taxType?: ItemTaxType;
}

export interface LineItemResult {
  qty: number;
  rate: number;
  discountPercent: number;
  taxPercent: number;
  taxType: ItemTaxType;
  /** qty * rate before discount (tax-inclusive if taxType is INCLUSIVE) */
  gross: number;
  /** discount amount removed from gross */
  discountAmount: number;
  /** post-discount, pre-tax taxable base (what the sample invoice calls "Amount") */
  amount: number;
  taxAmount: number;
  /** amount + taxAmount */
  total: number;
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calcLineItem(input: LineItemInput): LineItemResult {
  const discountPercent = input.discountPercent ?? 0;
  const taxType = input.taxType ?? "EXCLUSIVE";
  const gross = round2(input.qty * input.rate);
  const discountAmount = round2(gross * (discountPercent / 100));
  const discountedGross = round2(gross - discountAmount);

  if (NO_TAX_TYPES.has(taxType)) {
    return {
      qty: input.qty,
      rate: input.rate,
      discountPercent,
      taxPercent: 0,
      taxType,
      gross,
      discountAmount,
      amount: discountedGross,
      taxAmount: 0,
      total: discountedGross,
    };
  }

  if (taxType === "INCLUSIVE") {
    const amount = round2(discountedGross / (1 + input.taxPercent / 100));
    const taxAmount = round2(discountedGross - amount);
    return {
      qty: input.qty,
      rate: input.rate,
      discountPercent,
      taxPercent: input.taxPercent,
      taxType,
      gross,
      discountAmount,
      amount,
      taxAmount,
      total: discountedGross,
    };
  }

  // EXCLUSIVE
  const amount = discountedGross;
  const taxAmount = round2(amount * (input.taxPercent / 100));
  const total = round2(amount + taxAmount);

  return {
    qty: input.qty,
    rate: input.rate,
    discountPercent,
    taxPercent: input.taxPercent,
    taxType,
    gross,
    discountAmount,
    amount,
    taxAmount,
    total,
  };
}

export interface InvoiceCharges {
  freight?: number;
  loadingCharges?: number;
  packingCharges?: number;
  otherCharges?: number;
  invoiceDiscount?: number;
}

export interface InvoiceTotals {
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
}

export function calcInvoiceTotals(
  items: LineItemResult[],
  sameState: boolean,
  charges: InvoiceCharges = {}
): InvoiceTotals {
  const freight = charges.freight ?? 0;
  const loadingCharges = charges.loadingCharges ?? 0;
  const packingCharges = charges.packingCharges ?? 0;
  const otherCharges = charges.otherCharges ?? 0;
  const invoiceDiscount = charges.invoiceDiscount ?? 0;

  const subtotal = round2(items.reduce((sum, i) => sum + i.amount, 0));
  const itemDiscountTotal = round2(
    items.reduce((sum, i) => sum + i.discountAmount, 0)
  );
  const discountTotal = round2(itemDiscountTotal + invoiceDiscount);
  const taxTotal = round2(items.reduce((sum, i) => sum + i.taxAmount, 0));

  const cgstTotal = sameState ? round2(taxTotal / 2) : 0;
  const sgstTotal = sameState ? round2(taxTotal - cgstTotal) : 0;
  const igstTotal = sameState ? 0 : taxTotal;

  const rawTotal = round2(
    subtotal -
      invoiceDiscount +
      freight +
      loadingCharges +
      packingCharges +
      otherCharges +
      cgstTotal +
      sgstTotal +
      igstTotal
  );

  const grandTotal = Math.round(rawTotal);
  const roundOff = round2(grandTotal - rawTotal);

  return {
    subtotal,
    discountTotal,
    freight,
    loadingCharges,
    packingCharges,
    otherCharges,
    cgstTotal,
    sgstTotal,
    igstTotal,
    roundOff,
    grandTotal,
  };
}

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function twoDigitsToWords(n: number): string {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${TENS[tens]}${ones ? " " + ONES[ones] : ""}`;
}

function threeDigitsToWords(n: number): string {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundred) parts.push(`${ONES[hundred]} Hundred`);
  if (rest) parts.push(twoDigitsToWords(rest));
  return parts.join(" ");
}

/** Converts a rupee amount into Indian numbering words, e.g. 26984 -> "Twenty Six Thousand Nine Hundred Eighty Four Rupees Only" */
export function amountInWords(amount: number): string {
  const rupees = Math.floor(Math.round(amount));
  if (rupees === 0) return "Zero Rupees Only";

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const hundred = rupees % 1000;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigitsToWords(crore)} Crore`);
  if (lakh) parts.push(`${threeDigitsToWords(lakh)} Lakh`);
  if (thousand) parts.push(`${threeDigitsToWords(thousand)} Thousand`);
  if (hundred) parts.push(threeDigitsToWords(hundred));

  return `${parts.join(" ")} Rupees Only`;
}
