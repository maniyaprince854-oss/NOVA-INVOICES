"use client";

import { useRef } from "react";
import {
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductCombobox } from "@/components/invoice/product-combobox";
import { calcLineItem } from "@/lib/invoice-calc";
import { emptyItem, type InvoiceFormValues } from "@/lib/invoice-form-types";
import type { ItemTaxTypeValue } from "@/lib/schemas";
import type { Product } from "@/lib/types";

const TAX_TYPE_OPTIONS: { value: ItemTaxTypeValue; label: string }[] = [
  { value: "EXCLUSIVE", label: "Exclusive" },
  { value: "INCLUSIVE", label: "Inclusive" },
  { value: "EXEMPT", label: "Exempt" },
  { value: "ZERO_RATED", label: "Zero Rated" },
  { value: "NIL_RATED", label: "Nil Rated" },
  { value: "REVERSE_CHARGE", label: "Reverse Charge" },
];

export function ItemsTable({
  control,
  register,
  setValue,
}: {
  control: Control<InvoiceFormValues>;
  register: UseFormRegister<InvoiceFormValues>;
  setValue: UseFormSetValue<InvoiceFormValues>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });
  const items = useWatch({ control, name: "items" });

  // Tracks each row's product-default GST% (keyed by the stable field id)
  // so we can prompt for confirmation when the user manually overrides it.
  const productGstByRow = useRef<Map<string, number>>(new Map());

  function applyProduct(index: number, product: Product) {
    setValue(`items.${index}.productId`, product.id);
    setValue(`items.${index}.description`, product.name);
    setValue(`items.${index}.hsn`, product.hsn ?? "");
    setValue(`items.${index}.unit`, product.unit);
    setValue(`items.${index}.rate`, product.sellingPrice);
    setValue(`items.${index}.taxPercent`, product.gstPercent);
    setValue(`items.${index}.taxType`, product.taxType);
    productGstByRow.current.set(fields[index].id, product.gstPercent);
  }

  function handleTaxPercentBlur(index: number, fieldId: string) {
    const productGst = productGstByRow.current.get(fieldId);
    const current = items?.[index]?.taxPercent;
    if (productGst === undefined || current === undefined) return;
    if (Number(current) === productGst) return;

    const confirmed = window.confirm(
      `This product's GST rate is ${productGst}%. Change this invoice line to ${current}%?`
    );
    if (!confirmed) {
      setValue(`items.${index}.taxPercent`, productGst);
    }
  }

  function addRow() {
    append(emptyItem());
  }

  return (
    <div className="space-y-2">
      <div className="rounded-lg border overflow-x-auto">
        <Table className="table-fixed min-w-[1220px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[190px]">Product</TableHead>
              <TableHead className="w-[190px]">Description</TableHead>
              <TableHead className="w-24">HSN</TableHead>
              <TableHead className="w-20">Qty</TableHead>
              <TableHead className="w-20">Unit</TableHead>
              <TableHead className="w-28">Rate</TableHead>
              <TableHead className="w-20">Disc %</TableHead>
              <TableHead className="w-20">Tax %</TableHead>
              <TableHead className="w-[140px]">Tax Type</TableHead>
              <TableHead className="w-28 text-right">Total</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => {
              const item = items?.[index];
              const result = item
                ? calcLineItem({
                    qty: Number(item.qty) || 0,
                    rate: Number(item.rate) || 0,
                    discountPercent: Number(item.discountPercent) || 0,
                    taxPercent: Number(item.taxPercent) || 0,
                    taxType: item.taxType,
                  })
                : null;
              const taxDisabled =
                item?.taxType && item.taxType !== "EXCLUSIVE" && item.taxType !== "INCLUSIVE";

              return (
                <TableRow key={field.id}>
                  <TableCell>
                    <ProductCombobox
                      onSelect={(p) => applyProduct(index, p)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      {...register(`items.${index}.description`)}
                      placeholder="Item description"
                    />
                  </TableCell>
                  <TableCell>
                    <Input {...register(`items.${index}.hsn`)} />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.001"
                      {...register(`items.${index}.qty`, {
                        valueAsNumber: true,
                      })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input {...register(`items.${index}.unit`)} />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.rate`, {
                        valueAsNumber: true,
                      })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.discountPercent`, {
                        valueAsNumber: true,
                      })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={taxDisabled}
                      {...register(`items.${index}.taxPercent`, {
                        valueAsNumber: true,
                        onBlur: () => handleTaxPercentBlur(index, field.id),
                      })}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      items={TAX_TYPE_OPTIONS}
                      value={item?.taxType ?? "EXCLUSIVE"}
                      onValueChange={(v) =>
                        setValue(
                          `items.${index}.taxType`,
                          (v ?? "EXCLUSIVE") as ItemTaxTypeValue
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TAX_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    ₹{(result?.total ?? 0).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus className="size-4" />
        Add Item
      </Button>
    </div>
  );
}
