"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerCombobox } from "@/components/invoice/customer-combobox";
import { ItemsTable } from "@/components/invoice/items-table";
import { TotalsPanel } from "@/components/invoice/totals-panel";
import { calcLineItem, calcInvoiceTotals } from "@/lib/invoice-calc";
import { resolveSameState } from "@/lib/states";
import { invoiceSchema, type GstTaxModeValue } from "@/lib/schemas";
import {
  emptyItem,
  todayInputDate,
  type InvoiceFormValues,
} from "@/lib/invoice-form-types";
import type {
  Company,
  Customer,
  Invoice,
  InvoiceItem,
} from "@/lib/generated/prisma/client";
import { INDIAN_STATES } from "@/lib/states";
import { Save } from "lucide-react";

const TAX_MODE_ITEMS: Record<string, string> = {
  AUTO: "Auto Detect (Recommended)",
  CGST_SGST: "CGST + SGST",
  IGST: "IGST",
};

const PAYMENT_MODE_ITEMS: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CHEQUE: "Cheque",
  NEFT: "NEFT",
  RTGS: "RTGS",
  IMPS: "IMPS",
  BANK_TRANSFER: "Bank Transfer",
  CREDIT: "Credit",
};

type InvoiceWithRelations = Invoice & {
  items: InvoiceItem[];
  customer: Customer | null;
};

function toDefaultValues(
  company: Company,
  invoice?: InvoiceWithRelations
): InvoiceFormValues {
  if (!invoice) {
    return {
      invoiceDate: todayInputDate(),
      dueDate: "",
      customerId: "",
      placeOfSupply: company.state,
      taxMode: "AUTO",
      poNumber: "",
      transportName: "",
      vehicleNumber: "",
      lrNumber: "",
      dispatchFrom: company.name,
      paymentMode: "",
      notes: "",
      salesPerson: "",
      status: "UNPAID",
      freight: 0,
      loadingCharges: 0,
      packingCharges: 0,
      otherCharges: 0,
      invoiceDiscount: 0,
      amountPaid: 0,
      items: [emptyItem()],
    };
  }

  return {
    invoiceDate: new Date(invoice.invoiceDate).toISOString().slice(0, 10),
    dueDate: invoice.dueDate
      ? new Date(invoice.dueDate).toISOString().slice(0, 10)
      : "",
    customerId: invoice.customerId ?? "",
    placeOfSupply: invoice.placeOfSupply,
    taxMode: invoice.taxMode,
    poNumber: invoice.poNumber ?? "",
    transportName: invoice.transportName ?? "",
    vehicleNumber: invoice.vehicleNumber ?? "",
    lrNumber: invoice.lrNumber ?? "",
    dispatchFrom: invoice.dispatchFrom ?? "",
    paymentMode: invoice.paymentMode ?? "",
    notes: invoice.notes ?? "",
    salesPerson: invoice.salesPerson ?? "",
    status: invoice.status,
    freight: invoice.freight,
    loadingCharges: invoice.loadingCharges,
    packingCharges: invoice.packingCharges,
    otherCharges: invoice.otherCharges,
    invoiceDiscount: 0,
    amountPaid: invoice.amountPaid,
    items: invoice.items.map((item) => ({
      productId: item.productId ?? "",
      description: item.description,
      hsn: item.hsn ?? "",
      qty: item.qty,
      unit: item.unit,
      rate: item.rate,
      discountPercent: item.discountPercent,
      taxPercent: item.taxPercent,
      taxType: item.taxType,
    })),
  };
}

export function InvoiceForm({
  company,
  invoice,
}: {
  company: Company;
  invoice?: InvoiceWithRelations;
}) {
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    invoice?.customer ?? null
  );

  const { control, register, handleSubmit, setValue, formState } =
    useForm<InvoiceFormValues>({
      defaultValues: toDefaultValues(company, invoice),
    });

  const items = useWatch({ control, name: "items" });
  const placeOfSupply = useWatch({ control, name: "placeOfSupply" });
  const taxMode = useWatch({ control, name: "taxMode" });
  const paymentMode = useWatch({ control, name: "paymentMode" });
  const freight = useWatch({ control, name: "freight" });
  const loadingCharges = useWatch({ control, name: "loadingCharges" });
  const packingCharges = useWatch({ control, name: "packingCharges" });
  const otherCharges = useWatch({ control, name: "otherCharges" });
  const invoiceDiscount = useWatch({ control, name: "invoiceDiscount" });
  const amountPaid = useWatch({ control, name: "amountPaid" });

  const sameState = resolveSameState(
    (taxMode as GstTaxModeValue) || "AUTO",
    company.state,
    placeOfSupply || company.state
  );

  const totals = useMemo(() => {
    const lineResults = (items ?? []).map((item) =>
      calcLineItem({
        qty: Number(item.qty) || 0,
        rate: Number(item.rate) || 0,
        discountPercent: Number(item.discountPercent) || 0,
        taxPercent: Number(item.taxPercent) || 0,
        taxType: item.taxType,
      })
    );
    return calcInvoiceTotals(lineResults, sameState, {
      freight: Number(freight) || 0,
      loadingCharges: Number(loadingCharges) || 0,
      packingCharges: Number(packingCharges) || 0,
      otherCharges: Number(otherCharges) || 0,
      invoiceDiscount: Number(invoiceDiscount) || 0,
    });
  }, [
    items,
    sameState,
    freight,
    loadingCharges,
    packingCharges,
    otherCharges,
    invoiceDiscount,
  ]);

  function onSelectCustomer(customer: Customer) {
    setSelectedCustomer(customer);
    setValue("customerId", customer.id);
    setValue("placeOfSupply", customer.state);
  }

  async function onSubmit(values: InvoiceFormValues) {
    const payload = {
      invoiceDate: values.invoiceDate,
      dueDate: values.dueDate || null,
      customerId: values.customerId,
      placeOfSupply: values.placeOfSupply,
      taxMode: values.taxMode,
      poNumber: values.poNumber || null,
      transportName: values.transportName || null,
      vehicleNumber: values.vehicleNumber || null,
      lrNumber: values.lrNumber || null,
      dispatchFrom: values.dispatchFrom || null,
      paymentMode: values.paymentMode || null,
      notes: values.notes || null,
      salesPerson: values.salesPerson || null,
      status: values.status,
      freight: values.freight,
      loadingCharges: values.loadingCharges,
      packingCharges: values.packingCharges,
      otherCharges: values.otherCharges,
      invoiceDiscount: values.invoiceDiscount,
      amountPaid: values.amountPaid,
      items: values.items.map((item) => ({
        productId: item.productId || null,
        description: item.description,
        hsn: item.hsn || null,
        qty: item.qty,
        unit: item.unit,
        rate: item.rate,
        discountPercent: item.discountPercent,
        taxPercent: item.taxPercent,
        taxType: item.taxType,
      })),
    };

    const parsed = invoiceSchema.safeParse(payload);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      toast.error(firstError?.message ?? "Please check the invoice fields");
      return;
    }

    const res = await fetch(
      invoice ? `/api/invoices/${invoice.id}` : "/api/invoices",
      {
        method: invoice ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      toast.error("Failed to save invoice");
      return;
    }

    const saved = await res.json();
    toast.success(
      invoice
        ? `Invoice ${saved.invoiceNumber} updated`
        : `Invoice ${saved.invoiceNumber} created`
    );
    router.push(`/invoices/${saved.id}`);
  }

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
      if (e.key === "F12") {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start"
    >
      <div className="space-y-6 min-w-0">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-1.5">
              <Label>Customer</Label>
              <CustomerCombobox
                value={selectedCustomer}
                onSelect={onSelectCustomer}
              />
            </div>

            {selectedCustomer && (
              <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                {selectedCustomer.address && <div>{selectedCustomer.address}</div>}
                <div>
                  {[selectedCustomer.city, selectedCustomer.state, selectedCustomer.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </div>
                {selectedCustomer.gstin && (
                  <div>GSTIN: {selectedCustomer.gstin}</div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="invoiceDate">Invoice Date</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  {...register("invoiceDate")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" {...register("dueDate")} />
              </div>
              <div className="space-y-1.5">
                <Label>Place of Supply</Label>
                <Select
                  value={placeOfSupply}
                  onValueChange={(v) => setValue("placeOfSupply", v ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s.code} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>GST Tax Mode</Label>
                <Select
                  items={TAX_MODE_ITEMS}
                  value={taxMode}
                  onValueChange={(v) =>
                    setValue("taxMode", (v ?? "AUTO") as GstTaxModeValue)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUTO">Auto Detect (Recommended)</SelectItem>
                    <SelectItem value="CGST_SGST">CGST + SGST</SelectItem>
                    <SelectItem value="IGST">IGST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="poNumber">PO Number</Label>
                <Input id="poNumber" {...register("poNumber")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="transportName">Transport Name</Label>
                <Input id="transportName" {...register("transportName")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                <Input id="vehicleNumber" {...register("vehicleNumber")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lrNumber">LR Number</Label>
                <Input id="lrNumber" {...register("lrNumber")} />
              </div>
              <div className="space-y-1.5">
                <Label>Payment Mode</Label>
                <Select
                  items={PAYMENT_MODE_ITEMS}
                  value={paymentMode}
                  onValueChange={(v) => setValue("paymentMode", v ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="NEFT">NEFT</SelectItem>
                    <SelectItem value="RTGS">RTGS</SelectItem>
                    <SelectItem value="IMPS">IMPS</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CREDIT">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salesPerson">Sales Person</Label>
                <Input id="salesPerson" {...register("salesPerson")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <ItemsTable control={control} register={register} setValue={setValue} />

        <Card>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-6">
            <div className="space-y-1.5">
              <Label htmlFor="freight">Freight</Label>
              <Input
                id="freight"
                type="number"
                step="0.01"
                {...register("freight", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loadingCharges">Loading Charges</Label>
              <Input
                id="loadingCharges"
                type="number"
                step="0.01"
                {...register("loadingCharges", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="packingCharges">Packing Charges</Label>
              <Input
                id="packingCharges"
                type="number"
                step="0.01"
                {...register("packingCharges", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="otherCharges">Other Charges</Label>
              <Input
                id="otherCharges"
                type="number"
                step="0.01"
                {...register("otherCharges", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoiceDiscount">Invoice Discount</Label>
              <Input
                id="invoiceDiscount"
                type="number"
                step="0.01"
                {...register("invoiceDiscount", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amountPaid">Amount Paid</Label>
              <Input
                id="amountPaid"
                type="number"
                step="0.01"
                {...register("amountPaid", { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Remarks</Label>
          <Textarea id="notes" rows={2} {...register("notes")} />
        </div>
      </div>

      <div className="space-y-4 lg:sticky lg:top-6">
        <TotalsPanel
          totals={totals}
          sameState={sameState}
          amountPaid={Number(amountPaid) || 0}
        />
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={formState.isSubmitting}
        >
          <Save className="size-4" />
          Save Invoice
          <span className="ml-auto text-xs opacity-70">Ctrl+S</span>
        </Button>
      </div>
    </form>
  );
}
