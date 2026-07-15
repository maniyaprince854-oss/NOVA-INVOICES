import type { InvoiceTotals } from "@/lib/invoice-calc";
import { amountInWords } from "@/lib/invoice-calc";
import { Separator } from "@/components/ui/separator";

function money(n: number) {
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function TotalsPanel({
  totals,
  sameState,
  amountPaid,
}: {
  totals: InvoiceTotals;
  sameState: boolean;
  amountPaid: number;
}) {
  const balance = totals.grandTotal - amountPaid;

  return (
    <div className="rounded-lg border p-4 space-y-2 text-sm">
      <Row label="Subtotal" value={money(totals.subtotal)} />
      {totals.discountTotal > 0 && (
        <Row label="Discount" value={`- ${money(totals.discountTotal)}`} />
      )}
      {(totals.freight > 0 ||
        totals.loadingCharges > 0 ||
        totals.packingCharges > 0 ||
        totals.otherCharges > 0) && (
        <Row
          label="Charges"
          value={money(
            totals.freight +
              totals.loadingCharges +
              totals.packingCharges +
              totals.otherCharges
          )}
        />
      )}
      {sameState ? (
        <>
          <Row label="CGST" value={money(totals.cgstTotal)} />
          <Row label="SGST" value={money(totals.sgstTotal)} />
        </>
      ) : (
        <Row label="IGST" value={money(totals.igstTotal)} />
      )}
      <Row label="Round Off" value={money(totals.roundOff)} />
      <Separator />
      <Row
        label="Grand Total"
        value={money(totals.grandTotal)}
        emphasis
      />
      <Row label="Amount Paid" value={money(amountPaid)} />
      <Row
        label="Balance Due"
        value={money(balance)}
        emphasis={balance > 0}
      />
      <p className="pt-2 text-xs text-muted-foreground border-t">
        {amountInWords(totals.grandTotal)}
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={
        emphasis
          ? "flex items-center justify-between text-base font-semibold"
          : "flex items-center justify-between text-muted-foreground"
      }
    >
      <span>{label}</span>
      <span className={emphasis ? "text-foreground" : ""}>{value}</span>
    </div>
  );
}
