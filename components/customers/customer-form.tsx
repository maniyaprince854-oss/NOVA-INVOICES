"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { customerSchema, type CustomerInput } from "@/lib/schemas";
import type { Customer } from "@/lib/generated/prisma/client";
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
import { INDIAN_STATES } from "@/lib/states";

const CUSTOMER_TYPE_ITEMS: Record<string, string> = {
  RETAIL: "Retail",
  WHOLESALE: "Wholesale",
  DEALER: "Dealer",
  DISTRIBUTOR: "Distributor",
};

function toFormValues(customer?: Customer): CustomerInput {
  return {
    name: customer?.name ?? "",
    companyName: customer?.companyName ?? "",
    mobile: customer?.mobile ?? "",
    altMobile: customer?.altMobile ?? "",
    email: customer?.email ?? "",
    gstin: customer?.gstin ?? "",
    pan: customer?.pan ?? "",
    address: customer?.address ?? "",
    city: customer?.city ?? "",
    state: customer?.state ?? "",
    pincode: customer?.pincode ?? "",
    customerType: customer?.customerType ?? "RETAIL",
    openingBalance: customer?.openingBalance ?? 0,
    notes: customer?.notes ?? "",
    status: customer?.status ?? true,
  };
}

export function CustomerForm({ customer }: { customer?: Customer }) {
  const router = useRouter();
  const form = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: toFormValues(customer),
  });
  const { register, handleSubmit, control, setValue, formState } = form;
  const state = useWatch({ control, name: "state" });
  const customerType = useWatch({ control, name: "customerType" });

  async function onSubmit(values: CustomerInput) {
    const res = await fetch(
      customer ? `/api/customers/${customer.id}` : "/api/customers",
      {
        method: customer ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }
    );
    if (!res.ok) {
      toast.error("Failed to save customer");
      return;
    }
    toast.success(customer ? "Customer updated" : "Customer created");
    router.push("/customers");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          <div className="space-y-1.5">
            <Label htmlFor="name">Customer Name</Label>
            <Input id="name" autoFocus {...register("name")} />
            {formState.errors.name && (
              <p className="text-xs text-destructive">
                {formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" {...register("companyName")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mobile">Mobile</Label>
            <Input id="mobile" {...register("mobile")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="altMobile">Alternate Number</Label>
            <Input id="altMobile" {...register("altMobile")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
          </div>
          <div className="space-y-1.5">
            <Label>Customer Type</Label>
            <Select
              items={CUSTOMER_TYPE_ITEMS}
              value={customerType}
              onValueChange={(v) =>
                setValue(
                  "customerType",
                  v as CustomerInput["customerType"]
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RETAIL">Retail</SelectItem>
                <SelectItem value="WHOLESALE">Wholesale</SelectItem>
                <SelectItem value="DEALER">Dealer</SelectItem>
                <SelectItem value="DISTRIBUTOR">Distributor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gstin">GSTIN</Label>
            <Input id="gstin" {...register("gstin")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pan">PAN</Label>
            <Input id="pan" {...register("pan")} />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} />
          </div>
          <div className="space-y-1.5">
            <Label>State</Label>
            <Select
              value={state}
              onValueChange={(v) => setValue("state", v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map((s) => (
                  <SelectItem key={s.code} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formState.errors.state && (
              <p className="text-xs text-destructive">
                {formState.errors.state.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pincode">PIN Code</Label>
            <Input id="pincode" {...register("pincode")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="openingBalance">Opening Balance</Label>
            <Input
              id="openingBalance"
              type="number"
              step="0.01"
              {...register("openingBalance", { valueAsNumber: true })}
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/customers")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={formState.isSubmitting}>
          {customer ? "Save Changes" : "Create Customer"}
        </Button>
      </div>
    </form>
  );
}
