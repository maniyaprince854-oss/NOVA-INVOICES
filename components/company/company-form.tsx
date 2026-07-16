"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { companySchema, type CompanyInput } from "@/lib/schemas";
import type { Company } from "@/lib/types";
import { updateCompany } from "@/lib/repo/company";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { INDIAN_STATES } from "@/lib/states";

const DEFAULT_TAX_TYPE_ITEMS: Record<string, string> = {
  EXCLUSIVE: "Tax Exclusive",
  INCLUSIVE: "Tax Inclusive",
};

function toFormValues(company: Company): CompanyInput {
  return {
    name: company.name,
    logoUrl: company.logoUrl ?? "",
    gstin: company.gstin ?? "",
    pan: company.pan ?? "",
    addressLine1: company.addressLine1 ?? "",
    addressLine2: company.addressLine2 ?? "",
    city: company.city ?? "",
    state: company.state,
    pincode: company.pincode ?? "",
    phone: company.phone ?? "",
    email: company.email ?? "",
    website: company.website ?? "",
    bankName: company.bankName ?? "",
    accountName: company.accountName ?? "",
    accountNumber: company.accountNumber ?? "",
    ifsc: company.ifsc ?? "",
    branch: company.branch ?? "",
    invoicePrefix: company.invoicePrefix,
    financialYearStart: company.financialYearStart,
    termsAndConditions: company.termsAndConditions ?? "",
    signatureUrl: company.signatureUrl ?? "",
    defaultTaxType: company.defaultTaxType,
  };
}

export function CompanyForm({ company }: { company: Company }) {
  const form = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    defaultValues: toFormValues(company),
  });

  async function onSubmit(values: CompanyInput) {
    try {
      await updateCompany(values);
      toast.success("Company profile saved");
    } catch {
      toast.error("Failed to save company profile");
    }
  }

  const { register, handleSubmit, control, setValue, formState } = form;
  const state = useWatch({ control, name: "state" });
  const defaultTaxType = useWatch({ control, name: "defaultTaxType" });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="bank">Bank Details</TabsTrigger>
          <TabsTrigger value="invoice">Invoice Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" {...register("name")} />
                {formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {formState.errors.name.message}
                  </p>
                )}
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
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input id="addressLine1" {...register("addressLine1")} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input id="addressLine2" {...register("addressLine2")} />
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
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <Input id="website" {...register("website")} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank">
          <Card>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" {...register("bankName")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="accountName">Account Name</Label>
                <Input id="accountName" {...register("accountName")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" {...register("accountNumber")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ifsc">IFSC</Label>
                <Input id="ifsc" {...register("ifsc")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="branch">Branch</Label>
                <Input id="branch" {...register("branch")} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="termsAndConditions">
                  Terms &amp; Conditions
                </Label>
                <Textarea
                  id="termsAndConditions"
                  rows={4}
                  {...register("termsAndConditions")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice">
          <Card>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <div className="space-y-1.5">
                <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                <Input id="invoicePrefix" {...register("invoicePrefix")} />
                {formState.errors.invoicePrefix && (
                  <p className="text-xs text-destructive">
                    {formState.errors.invoicePrefix.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="financialYearStart">
                  Financial Year Start Month
                </Label>
                <Input
                  id="financialYearStart"
                  type="number"
                  min={1}
                  max={12}
                  {...register("financialYearStart", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Default Tax Type</Label>
                <Select
                  items={DEFAULT_TAX_TYPE_ITEMS}
                  value={defaultTaxType}
                  onValueChange={(v) =>
                    setValue("defaultTaxType", v as "EXCLUSIVE" | "INCLUSIVE")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXCLUSIVE">Tax Exclusive</SelectItem>
                    <SelectItem value="INCLUSIVE">Tax Inclusive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={formState.isSubmitting}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
