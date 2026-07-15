import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Company, Customer, Invoice, InvoiceItem } from "@/lib/generated/prisma/client";
import { amountInWords } from "@/lib/invoice-calc";
import { resolveSameState } from "@/lib/states";

export type InvoiceForPdf = Invoice & {
  items: InvoiceItem[];
  customer: Customer | null;
  company: Company;
  /** Sum of this customer's outstanding balance across all their invoices (including this one). Defaults to this invoice's own balance when not supplied. */
  totalDue?: number;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 36;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const MIN_TABLE_BODY_HEIGHT = 190;

const INK = rgb(0.08, 0.09, 0.12);
const MUTED = rgb(0.42, 0.42, 0.46);
const LINE = rgb(0.55, 0.55, 0.58);
const ACCENT = rgb(0.11, 0.29, 0.55);

function money(n: number) {
  return `Rs. ${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface Ctx {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  y: number;
}

function newPage(doc: PDFDocument): PDFPage {
  return doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
}

function text(
  ctx: Ctx,
  str: string,
  x: number,
  y: number,
  opts: {
    size?: number;
    font?: PDFFont;
    color?: ReturnType<typeof rgb>;
    align?: "left" | "right" | "center";
  } = {}
) {
  const size = opts.size ?? 9;
  const font = opts.font ?? ctx.font;
  const color = opts.color ?? INK;
  let drawX = x;
  if (opts.align === "right") {
    drawX = x - font.widthOfTextAtSize(str, size);
  } else if (opts.align === "center") {
    drawX = x - font.widthOfTextAtSize(str, size) / 2;
  }
  ctx.page.drawText(str, { x: drawX, y, size, font, color });
}

function rect(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { fill?: ReturnType<typeof rgb>; borderWidth?: number } = {}
) {
  ctx.page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    borderColor: LINE,
    borderWidth: opts.borderWidth ?? 0.75,
    color: opts.fill,
  });
}

function hline(ctx: Ctx, x1: number, x2: number, y: number, thickness = 0.75) {
  ctx.page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness,
    color: LINE,
  });
}

function vline(ctx: Ctx, x: number, y1: number, y2: number) {
  ctx.page.drawLine({
    start: { x, y: y1 },
    end: { x, y: y2 },
    thickness: 0.75,
    color: LINE,
  });
}

function wrapText(
  ctx: Ctx,
  str: string,
  maxWidth: number,
  size: number,
  font?: PDFFont
): string[] {
  const measureFont = font ?? ctx.font;
  const words = str.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measureFont.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateInvoicePdf(invoice: InvoiceForPdf): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const ctx: Ctx = {
    doc,
    page: newPage(doc),
    font,
    bold,
    y: PAGE_HEIGHT - MARGIN,
  };

  const company = invoice.company;
  const sameState = resolveSameState(
    invoice.taxMode,
    company.state,
    invoice.placeOfSupply
  );
  const totalDue = invoice.totalDue ?? invoice.balance;

  drawHeader(ctx, company);
  drawBillToAndMeta(ctx, invoice);
  drawDispatchFrom(ctx, invoice, company);
  drawItemsTable(ctx, invoice);
  drawTotalsFooter(ctx, invoice, sameState, company, totalDue);
  drawSignatureFooter(ctx, company);

  return doc.save();
}

function drawLogo(ctx: Ctx, cx: number, cy: number, r: number, initials: string) {
  ctx.page.drawCircle({ x: cx, y: cy, size: r, color: ACCENT });
  const size = r * 0.9;
  text(ctx, initials, cx, cy - size / 2.8, {
    size,
    font: ctx.bold,
    color: rgb(1, 1, 1),
    align: "center",
  });
}

function drawHeader(ctx: Ctx, company: Company) {
  const topY = ctx.y;
  const logoR = 17;
  const hasName = company.name.trim().length > 0;
  const initials = company.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const textX = hasName ? MARGIN + logoR * 2 + 12 : MARGIN;

  if (hasName) {
    drawLogo(ctx, MARGIN + logoR, topY - logoR + 4, logoR, initials || "?");
  }

  text(ctx, company.name.toUpperCase(), textX, topY - 4, {
    size: 17,
    font: ctx.bold,
    color: ACCENT,
  });

  let subY = topY - 20;
  const addressParts = [
    company.addressLine1,
    company.addressLine2,
    [company.city, company.state, company.pincode].filter(Boolean).join(", "),
  ].filter(Boolean);
  for (const line of addressParts) {
    text(ctx, String(line), textX, subY, { size: 8.5, color: MUTED });
    subY -= 11;
  }
  const contactParts = [
    company.phone ? `Phone: ${company.phone}` : null,
    company.email ? `Email: ${company.email}` : null,
  ].filter(Boolean);
  if (contactParts.length) {
    text(ctx, contactParts.join("   |   "), textX, subY, {
      size: 8.5,
      color: MUTED,
    });
    subY -= 11;
  }

  if (company.gstin) {
    text(ctx, `GSTIN: ${company.gstin}`, PAGE_WIDTH - MARGIN, topY - 4, {
      size: 9,
      font: ctx.bold,
      align: "right",
    });
  }
  if (company.pan) {
    text(ctx, `PAN: ${company.pan}`, PAGE_WIDTH - MARGIN, topY - 16, {
      size: 9,
      align: "right",
    });
  }

  ctx.y = Math.min(subY, topY - logoR * 2 - 6) - 10;
  hline(ctx, MARGIN, PAGE_WIDTH - MARGIN, ctx.y, 1.2);
  ctx.y -= 4;
}

function drawBillToAndMeta(ctx: Ctx, invoice: InvoiceForPdf) {
  const boxTop = ctx.y;
  const boxHeight = 96;
  const leftW = Math.round(CONTENT_WIDTH * 0.6);
  const rightX = MARGIN + leftW;
  const rightW = CONTENT_WIDTH - leftW;

  rect(ctx, MARGIN, boxTop - boxHeight, leftW, boxHeight);
  rect(ctx, rightX, boxTop - boxHeight, rightW, boxHeight);

  let ly = boxTop - 14;
  text(ctx, "Bill To:", MARGIN + 8, ly, { size: 8.5, font: ctx.bold, color: MUTED });
  ly -= 14;
  text(ctx, invoice.billToName.toUpperCase(), MARGIN + 8, ly, {
    size: 10.5,
    font: ctx.bold,
  });
  ly -= 13;
  if (invoice.billToCompany) {
    text(ctx, invoice.billToCompany, MARGIN + 8, ly, { size: 8.5 });
    ly -= 11;
  }
  if (invoice.billToAddress) {
    const lines = wrapText(ctx, invoice.billToAddress, leftW - 16, 8.5);
    for (const line of lines.slice(0, 2)) {
      text(ctx, line, MARGIN + 8, ly, { size: 8.5 });
      ly -= 11;
    }
  }
  const cityLine = [invoice.billToCity, invoice.billToState, invoice.billToPincode]
    .filter(Boolean)
    .join(", ");
  if (cityLine) {
    text(ctx, cityLine, MARGIN + 8, ly, { size: 8.5 });
    ly -= 13;
  }
  if (invoice.billToMobile) {
    text(ctx, `Mo:  ${invoice.billToMobile}`, MARGIN + 8, ly, { size: 8.5 });
    ly -= 11;
  }
  const idLine = [
    invoice.billToGstin ? `GSTIN: ${invoice.billToGstin}` : null,
    invoice.billToPan ? `PAN: ${invoice.billToPan}` : null,
  ]
    .filter(Boolean)
    .join("   ");
  if (idLine) {
    text(ctx, idLine, MARGIN + 8, ly, { size: 8.5 });
  }

  let ry = boxTop - 14;
  text(ctx, "Invoice", rightX + rightW / 2, ry, {
    size: 10,
    font: ctx.bold,
    align: "center",
  });
  ry -= 18;
  const metaRow = (label: string, value: string) => {
    text(ctx, label, rightX + 8, ry, { size: 8.5, color: MUTED });
    text(ctx, value, rightX + rightW - 8, ry, {
      size: 9,
      font: ctx.bold,
      align: "right",
    });
    ry -= 15;
  };
  metaRow("Number:", invoice.invoiceNumber);
  metaRow("Date:", fmtDate(invoice.invoiceDate));
  metaRow("Place of Supply:", invoice.placeOfSupply);
  if (invoice.poNumber) metaRow("PO Number:", invoice.poNumber);
  if (invoice.dueDate) metaRow("Due Date:", fmtDate(invoice.dueDate));

  ctx.y = boxTop - boxHeight - 10;
}

function drawDispatchFrom(ctx: Ctx, invoice: InvoiceForPdf, company: Company) {
  const startY = ctx.y;
  text(ctx, "Dispatch From:", MARGIN, startY, { size: 8.5, font: ctx.bold, color: MUTED });
  let dy = startY - 13;

  text(ctx, (invoice.dispatchFrom || company.name).toUpperCase(), MARGIN, dy, {
    size: 9.5,
    font: ctx.bold,
  });
  dy -= 12;

  const addr = [
    company.addressLine1,
    company.addressLine2,
    [company.city, company.state, company.pincode].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");
  if (addr) {
    const lines = wrapText(ctx, addr, CONTENT_WIDTH, 8.5);
    for (const line of lines.slice(0, 1)) {
      text(ctx, line, MARGIN, dy, { size: 8.5, color: MUTED });
      dy -= 11;
    }
  }

  const contact = [
    company.phone ? `Mo: ${company.phone}` : null,
    company.email ? `Email: ${company.email}` : null,
  ]
    .filter(Boolean)
    .join("     ");
  if (contact) {
    text(ctx, contact, MARGIN, dy, { size: 8.5, color: MUTED });
    dy -= 11;
  }

  const extras = [
    invoice.transportName ? `Transport: ${invoice.transportName}` : null,
    invoice.vehicleNumber ? `Vehicle No: ${invoice.vehicleNumber}` : null,
    invoice.lrNumber ? `LR No: ${invoice.lrNumber}` : null,
  ].filter(Boolean);
  if (extras.length) {
    text(ctx, extras.join("     "), MARGIN, dy, { size: 8.5, color: MUTED });
    dy -= 11;
  }

  ctx.y = dy - 4;
}

const COL = {
  sn: 18,
  item: 158,
  hsn: 42,
  qty: 48,
  rate: 50,
  amount: 55,
  tax: 70,
  total: 55,
};
const TABLE_ROW_H = 18;

function tableColumns(): [string, number, "left" | "right"][] {
  return [
    ["#", COL.sn, "left"],
    ["Item", COL.item, "left"],
    ["HSN", COL.hsn, "left"],
    ["Qty", COL.qty, "right"],
    ["Rate", COL.rate, "right"],
    ["Amount", COL.amount, "right"],
    ["Taxes", COL.tax, "right"],
    ["Total", COL.total, "right"],
  ];
}

function drawTableHeaderRow(ctx: Ctx, y: number): number {
  const rowH = 20;
  rect(ctx, MARGIN, y - rowH, CONTENT_WIDTH, rowH, { fill: rgb(0.95, 0.96, 0.98) });
  let x = MARGIN + 4;
  const headerY = y - 14;
  for (const [label, w, align] of tableColumns()) {
    text(ctx, label, align === "right" ? x + w - 4 : x, headerY, {
      size: 8,
      font: ctx.bold,
      align,
    });
    x += w;
  }
  return y - rowH;
}

function drawTableRow(
  ctx: Ctx,
  y: number,
  cells: { sn: string; item: string; hsn: string; qty: string; rate: string; amount: string; tax: string; total: string },
  rowH: number,
  itemLines: string[]
) {
  let x = MARGIN + 4;
  const rowY = y - 13;

  text(ctx, cells.sn, x, rowY, { size: 8.5 });
  x += COL.sn;

  itemLines.forEach((line, i) => {
    text(ctx, line, x, rowY - i * 11, { size: 8.5, font: ctx.bold });
  });
  x += COL.item;

  text(ctx, cells.hsn, x, rowY, { size: 8.5 });
  x += COL.hsn;

  text(ctx, cells.qty, x + COL.qty - 4, rowY, { size: 8.5, align: "right" });
  x += COL.qty;

  text(ctx, cells.rate, x + COL.rate - 4, rowY, { size: 8.5, align: "right" });
  x += COL.rate;

  text(ctx, cells.amount, x + COL.amount - 4, rowY, { size: 8.5, align: "right" });
  x += COL.amount;

  text(ctx, cells.tax, x + COL.tax - 4, rowY, { size: 7.5, align: "right" });
  x += COL.tax;

  text(ctx, cells.total, x + COL.total - 4, rowY, {
    size: 8.5,
    font: ctx.bold,
    align: "right",
  });
}

function taxLabel(item: InvoiceItem): string {
  switch (item.taxType) {
    case "EXEMPT":
      return "Exempt";
    case "ZERO_RATED":
      return "Zero Rated";
    case "NIL_RATED":
      return "Nil Rated";
    case "REVERSE_CHARGE":
      return "Reverse Charge";
    default:
      return `${item.taxAmount.toLocaleString("en-IN")} (${item.taxPercent}%)`;
  }
}

/** Draws the items table with a fixed minimum body height (like a printed ledger), a
 * "Total Qty" row underneath, and page-breaks with a repeated header when items overflow. */
function drawItemsTable(ctx: Ctx, invoice: InvoiceForPdf) {
  const tableTop = ctx.y;
  let y = drawTableHeaderRow(ctx, tableTop);
  const tableLeft = MARGIN;
  const tableRight = PAGE_WIDTH - MARGIN;

  let totalQty = 0;
  let colX = tableLeft;
  const colStops = tableColumns().map(([, w]) => {
    colX += w;
    return colX;
  });

  invoice.items.forEach((item, idx) => {
    if (y - TABLE_ROW_H < MARGIN + 100) {
      vline(ctx, tableLeft, tableTop, y);
      vline(ctx, tableRight, tableTop, y);
      ctx.page = newPage(ctx.doc);
      ctx.y = PAGE_HEIGHT - MARGIN;
      y = drawTableHeaderRow(ctx, ctx.y);
    }

    const descLines = wrapText(ctx, item.description, COL.item - 8, 8.5, ctx.bold);
    const rowH = Math.max(TABLE_ROW_H, descLines.length * 11 + 7);

    drawTableRow(
      ctx,
      y,
      {
        sn: String(idx + 1),
        item: "",
        hsn: item.hsn ?? "-",
        qty: `${item.qty} ${item.unit}`,
        rate: item.rate.toLocaleString("en-IN"),
        amount: item.amount.toLocaleString("en-IN"),
        tax: taxLabel(item),
        total: item.total.toLocaleString("en-IN"),
      },
      rowH,
      descLines
    );

    totalQty += item.qty;
    y -= rowH;
  });

  // pad the table with blank ruled rows so it always has a generous minimum
  // height, matching the spacious ledger look of the sample invoice
  const bodyHeightSoFar = tableTop - 20 - y;
  const padding = Math.max(0, MIN_TABLE_BODY_HEIGHT - bodyHeightSoFar);
  const paddedBottom = y - padding;

  for (const stop of colStops.slice(0, -1)) {
    vline(ctx, stop, tableTop - 20, paddedBottom);
  }
  vline(ctx, tableLeft, tableTop, paddedBottom);
  vline(ctx, tableRight, tableTop, paddedBottom);
  hline(ctx, tableLeft, tableRight, paddedBottom);

  // horizontal rules between each item row (padding area stays blank)
  let ruleY = tableTop - 20;
  invoice.items.forEach(() => {
    hline(ctx, tableLeft, tableRight, ruleY);
    ruleY -= TABLE_ROW_H;
  });

  const qtyRowH = 18;
  rect(ctx, tableLeft, paddedBottom - qtyRowH, CONTENT_WIDTH, qtyRowH);
  text(ctx, "Total qty", MARGIN + 8, paddedBottom - qtyRowH + 5, {
    size: 8.5,
    font: ctx.bold,
  });
  text(
    ctx,
    `${totalQty}(${invoice.items[0]?.unit ?? "Pcs"})`,
    MARGIN + 90,
    paddedBottom - qtyRowH + 5,
    { size: 8.5, font: ctx.bold }
  );

  ctx.y = paddedBottom - qtyRowH - 14;
}

function drawTotalsFooter(
  ctx: Ctx,
  invoice: InvoiceForPdf,
  sameState: boolean,
  company: Company,
  totalDue: number
) {
  const boxW = 210;
  const boxX = PAGE_WIDTH - MARGIN - boxW;
  const leftW = CONTENT_WIDTH - boxW - 16;

  const rows: [string, string, boolean][] = [];
  rows.push(["Basic Amount", money(invoice.subtotal), false]);
  if (invoice.discountTotal > 0) {
    rows.push(["Discount", `- ${money(invoice.discountTotal)}`, false]);
  }
  const charges =
    invoice.freight + invoice.loadingCharges + invoice.packingCharges + invoice.otherCharges;
  if (charges > 0) rows.push(["Freight / Charges", money(charges), false]);
  if (sameState) {
    rows.push(["CGST", money(invoice.cgstTotal), false]);
    rows.push(["SGST", money(invoice.sgstTotal), false]);
  } else {
    rows.push(["IGST", money(invoice.igstTotal), false]);
  }
  rows.push(["Round off", money(invoice.roundOff), false]);
  rows.push(["Net payable", money(invoice.grandTotal), true]);
  rows.push(["Total due", money(totalDue), true]);

  const rowH = 17;
  const boxTop = ctx.y;
  const boxHeight = rows.length * rowH + 8;
  rect(ctx, boxX, boxTop - boxHeight, boxW, boxHeight);

  let ty = boxTop - 13;
  rows.forEach(([label, value, bold], idx) => {
    if (bold) hline(ctx, boxX, boxX + boxW, ty + 12);
    text(ctx, label, boxX + 8, ty, {
      size: bold ? 9.5 : 9,
      font: bold ? ctx.bold : ctx.font,
      color: bold ? INK : MUTED,
    });
    text(ctx, value, boxX + boxW - 8, ty, {
      size: bold ? 9.5 : 9,
      font: bold ? ctx.bold : ctx.font,
      align: "right",
    });
    ty -= rowH;
    void idx;
  });

  // Left column: amount in words + bank details, vertically aligned with the box
  let ly = boxTop - 6;
  text(ctx, "Net Payable in Words", MARGIN, ly, { size: 8, color: MUTED });
  ly -= 12;
  const words = amountInWords(invoice.grandTotal);
  const wrapped = wrapText(ctx, words, leftW, 9.5, ctx.bold);
  for (const line of wrapped) {
    text(ctx, line, MARGIN, ly, { size: 9.5, font: ctx.bold });
    ly -= 13;
  }

  if (company.bankName || company.accountNumber) {
    ly -= 8;
    text(ctx, "Bank detail", MARGIN, ly, { size: 8.5, font: ctx.bold, color: MUTED });
    ly -= 12;
    const bankLines = [
      company.bankName ? `BANK NAME : ${company.bankName}` : null,
      company.accountName ? `AC Name: ${company.accountName}` : null,
      company.accountNumber ? `AC NO : ${company.accountNumber}` : null,
      company.ifsc ? `IFSC : ${company.ifsc}` : null,
      company.branch ? `BRANCH : ${company.branch}` : null,
    ].filter(Boolean) as string[];
    for (const line of bankLines) {
      text(ctx, line, MARGIN, ly, { size: 8 });
      ly -= 11;
    }
  }

  ctx.y = Math.min(boxTop - boxHeight, ly) - 14;
}

const FOOTER_MIN_HEIGHT = 96;
const FOOTER_MAX_TERMS_LINES = 10;

function drawSignatureFooter(ctx: Ctx, company: Company) {
  const col1W = Math.round(CONTENT_WIDTH * 0.56);
  const col2W = Math.round(CONTENT_WIDTH * 0.2);
  const col2X = MARGIN + col1W;
  const col3X = col2X + col2W;

  const termsLines = company.termsAndConditions
    ? company.termsAndConditions
        .split("\n")
        .flatMap((l) => wrapText(ctx, l, col1W - 16, 8))
        .slice(0, FOOTER_MAX_TERMS_LINES)
    : [];

  // Header label (14) + one line per wrapped term (10 each) + bottom padding (14),
  // so the box always grows to fit its content instead of clipping it.
  const termsBlockHeight = termsLines.length ? 26 + termsLines.length * 10 + 10 : 0;
  const footerH = Math.max(FOOTER_MIN_HEIGHT, termsBlockHeight + 20);

  const top = ctx.y;
  const bottom = top - footerH;

  rect(ctx, MARGIN, bottom, CONTENT_WIDTH, footerH);
  vline(ctx, col2X, top, bottom);
  vline(ctx, col3X, top, bottom);

  if (termsLines.length) {
    text(ctx, "Terms and Conditions", MARGIN + 8, top - 14, {
      size: 8.5,
      font: ctx.bold,
      color: MUTED,
    });
    let ty = top - 26;
    for (const line of termsLines) {
      text(ctx, line, MARGIN + 8, ty, { size: 8 });
      ty -= 10;
    }
  }

  text(ctx, "Receiver's Signature", col2X + col2W / 2, bottom + 8, {
    size: 8,
    color: MUTED,
    align: "center",
  });

  text(ctx, `For ${company.name}`, col3X + 8, top - 14, {
    size: 8.5,
    font: ctx.bold,
  });
  text(ctx, "Authorised Signature", col3X + (CONTENT_WIDTH - col1W - col2W) / 2, bottom + 8, {
    size: 8,
    color: MUTED,
    align: "center",
  });

  ctx.y = bottom - 20;
}
