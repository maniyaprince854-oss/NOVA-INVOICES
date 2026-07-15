import { describe, it, expect } from "vitest";
import {
  calcLineItem,
  calcInvoiceTotals,
  amountInWords,
  round2,
} from "./invoice-calc";

describe("calcLineItem", () => {
  it("computes amount and tax with no discount", () => {
    const r = calcLineItem({ qty: 30, rate: 694.92, taxPercent: 18 });
    expect(r.gross).toBeCloseTo(20847.6, 2);
    expect(r.amount).toBeCloseTo(20847.6, 2);
    expect(r.taxAmount).toBeCloseTo(3752.57, 1);
    expect(r.total).toBeCloseTo(24600.16, 1);
  });

  it("applies a line discount before tax", () => {
    const r = calcLineItem({
      qty: 10,
      rate: 100,
      discountPercent: 10,
      taxPercent: 18,
    });
    expect(r.gross).toBe(1000);
    expect(r.discountAmount).toBe(100);
    expect(r.amount).toBe(900);
    expect(r.taxAmount).toBe(162);
    expect(r.total).toBe(1062);
  });

  it("backs out tax from a tax-inclusive rate", () => {
    const r = calcLineItem({
      qty: 1,
      rate: 118,
      taxPercent: 18,
      taxType: "INCLUSIVE",
    });
    expect(r.gross).toBe(118);
    expect(r.amount).toBe(100);
    expect(r.taxAmount).toBe(18);
    expect(r.total).toBe(118);
  });

  it("applies discount before backing out inclusive tax", () => {
    const r = calcLineItem({
      qty: 1,
      rate: 118,
      discountPercent: 10,
      taxPercent: 18,
      taxType: "INCLUSIVE",
    });
    // discountedGross = 106.2, base = 106.2 / 1.18 = 90
    expect(r.total).toBe(106.2);
    expect(r.amount).toBe(90);
    expect(r.taxAmount).toBeCloseTo(16.2, 2);
  });

  it.each(["EXEMPT", "ZERO_RATED", "NIL_RATED", "REVERSE_CHARGE"] as const)(
    "collects zero tax for %s items regardless of taxPercent",
    (taxType) => {
      const r = calcLineItem({ qty: 2, rate: 500, taxPercent: 18, taxType });
      expect(r.taxAmount).toBe(0);
      expect(r.taxPercent).toBe(0);
      expect(r.amount).toBe(1000);
      expect(r.total).toBe(1000);
    }
  );
});

describe("calcInvoiceTotals", () => {
  it("splits tax into CGST+SGST for same-state invoices", () => {
    const items = [
      calcLineItem({ qty: 1, rate: 2020, taxPercent: 18 }),
      calcLineItem({ qty: 30, rate: 694.92, taxPercent: 18 }),
    ];
    const totals = calcInvoiceTotals(items, true);

    expect(totals.igstTotal).toBe(0);
    // CGST/SGST split can differ by a paisa when the tax total is odd.
    expect(totals.cgstTotal).toBeCloseTo(totals.sgstTotal, 1);
    expect(round2(totals.cgstTotal + totals.sgstTotal)).toBeCloseTo(
      4116.16,
      0
    );
    expect(totals.grandTotal).toBe(26984);
  });

  it("uses IGST for different-state invoices", () => {
    const items = [calcLineItem({ qty: 1, rate: 1000, taxPercent: 18 })];
    const totals = calcInvoiceTotals(items, false);

    expect(totals.cgstTotal).toBe(0);
    expect(totals.sgstTotal).toBe(0);
    expect(totals.igstTotal).toBe(180);
    expect(totals.grandTotal).toBe(1180);
  });

  it("rounds off the grand total to the nearest rupee", () => {
    const items = [calcLineItem({ qty: 1, rate: 100.4, taxPercent: 18 })];
    const totals = calcInvoiceTotals(items, true);
    // 100.40 + 18.072 tax = 118.472 -> rounds to 118, roundOff = -0.47
    expect(totals.grandTotal).toBe(118);
    expect(totals.roundOff).toBeCloseTo(-0.47, 2);
  });

  it("applies freight/loading/packing/other charges and invoice-level discount", () => {
    const items = [calcLineItem({ qty: 1, rate: 1000, taxPercent: 0 })];
    const totals = calcInvoiceTotals(items, true, {
      freight: 50,
      loadingCharges: 10,
      packingCharges: 5,
      otherCharges: 2,
      invoiceDiscount: 100,
    });
    expect(totals.grandTotal).toBe(967); // 1000 - 100 + 50+10+5+2
    expect(totals.discountTotal).toBe(100);
  });
});

describe("amountInWords", () => {
  it("matches the sample invoice wording", () => {
    expect(amountInWords(26984)).toBe(
      "Twenty Six Thousand Nine Hundred Eighty Four Rupees Only"
    );
  });

  it("handles zero", () => {
    expect(amountInWords(0)).toBe("Zero Rupees Only");
  });

  it("handles lakhs and crores", () => {
    expect(amountInWords(1234567)).toBe(
      "Twelve Lakh Thirty Four Thousand Five Hundred Sixty Seven Rupees Only"
    );
  });

  it("handles a round hundred", () => {
    expect(amountInWords(100)).toBe("One Hundred Rupees Only");
  });
});
