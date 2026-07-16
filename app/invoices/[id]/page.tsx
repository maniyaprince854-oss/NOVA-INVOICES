"use client";

import { useParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { getInvoice, getCustomerTotalDue } from "@/lib/invoice-service";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceActions } from "@/components/invoice/invoice-actions";
import { amountInWords } from "@/lib/invoice-calc";
import { resolveSameState } from "@/lib/states";

const TAX_TYPE_LABEL: Record<string, string> = {
  EXCLUSIVE: "Exclusive",
  INCLUSIVE: "Inclusive",
  EXEMPT: "Exempt",
  ZERO_RATED: "Zero Rated",
  NIL_RATED: "Nil Rated",
  REVERSE_CHARGE: "Reverse Charge",
};

const TAX_MODE_LABEL: Record<string, string> = {
  AUTO: "Auto Detect",
  CGST_SGST: "CGST + SGST (Manual)",
  IGST: "IGST (Manual)",
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PAID: "default",
  PARTIAL: "secondary",
  UNPAID: "outline",
  OVERDUE: "destructive",
  DRAFT: "secondary",
  CANCELLED: "destructive",
};

function money(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();

  const invoice = useLiveQuery(() => getInvoice(id), [id]);
  const company = useLiveQuery(() => db?.companies.toCollection().first(), []);
  const totalDue =
    useLiveQuery(
      () => (invoice?.customerId ? getCustomerTotalDue(invoice.customerId) : invoice?.balance ?? 0),
      [invoice?.customerId, invoice?.balance]
    ) ?? invoice?.balance ?? 0;

  if (invoice === undefined) return null;
  if (!invoice) {
    return (
      <div className="mx-auto max-w-4xl p-4 sm:p-8">
        <p className="text-muted-foreground">Invoice not found.</p>
      </div>
    );
  }

  const sameState = resolveSameState(
    invoice.taxMode,
    company?.state ?? invoice.billToState,
    invoice.placeOfSupply
  );

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight">
              {invoice.invoiceNumber}
            </h1>
            <Badge variant={STATUS_VARIANT[invoice.status] ?? "outline"}>
              {invoice.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
            {invoice.dueDate &&
              ` · Due ${new Date(invoice.dueDate).toLocaleDateString("en-IN")}`}
          </p>
        </div>
        <InvoiceActions id={invoice.id} status={invoice.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-lg border p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            Bill To
          </h2>
          <div className="font-medium">{invoice.billToName}</div>
          {invoice.billToCompany && <div>{invoice.billToCompany}</div>}
          {invoice.billToAddress && (
            <div className="text-sm text-muted-foreground">
              {invoice.billToAddress}
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            {[invoice.billToCity, invoice.billToState, invoice.billToPincode]
              .filter(Boolean)
              .join(", ")}
          </div>
          {invoice.billToGstin && (
            <div className="text-sm text-muted-foreground">
              GSTIN: {invoice.billToGstin}
            </div>
          )}
        </div>
        <div className="rounded-lg border p-4 space-y-1 text-sm">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            Shipment Details
          </h2>
          <div>Place of Supply: {invoice.placeOfSupply}</div>
          <div>GST Tax Mode: {TAX_MODE_LABEL[invoice.taxMode] ?? invoice.taxMode}</div>
          {invoice.poNumber && <div>PO Number: {invoice.poNumber}</div>}
          {invoice.transportName && (
            <div>Transport: {invoice.transportName}</div>
          )}
          {invoice.vehicleNumber && (
            <div>Vehicle: {invoice.vehicleNumber}</div>
          )}
          {invoice.paymentMode && (
            <div>Payment Mode: {invoice.paymentMode}</div>
          )}
        </div>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>HSN</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Tax</TableHead>
              <TableHead>Tax Type</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.hsn ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {item.qty} {item.unit}
                </TableCell>
                <TableCell className="text-right">{money(item.rate)}</TableCell>
                <TableCell className="text-right">{money(item.amount)}</TableCell>
                <TableCell className="text-right">
                  {item.taxAmount > 0
                    ? `${money(item.taxAmount)} (${item.taxPercent}%)`
                    : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {TAX_TYPE_LABEL[item.taxType] ?? item.taxType}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {money(item.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <div className="w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{money(invoice.subtotal)}</span>
          </div>
          {invoice.discountTotal > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Discount</span>
              <span>- {money(invoice.discountTotal)}</span>
            </div>
          )}
          {sameState ? (
            <>
              <div className="flex justify-between text-muted-foreground">
                <span>CGST</span>
                <span>{money(invoice.cgstTotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>SGST</span>
                <span>{money(invoice.sgstTotal)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-muted-foreground">
              <span>IGST</span>
              <span>{money(invoice.igstTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Round Off</span>
            <span>{money(invoice.roundOff)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold border-t pt-1">
            <span>Grand Total</span>
            <span>{money(invoice.grandTotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Amount Paid</span>
            <span>{money(invoice.amountPaid)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Balance Due</span>
            <span>{money(invoice.balance)}</span>
          </div>
          {totalDue !== invoice.balance && (
            <div className="flex justify-between font-semibold border-t pt-1">
              <span>Total Due (all invoices)</span>
              <span>{money(totalDue)}</span>
            </div>
          )}
          <p className="pt-2 text-xs text-muted-foreground border-t">
            {amountInWords(invoice.grandTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}
