"use client";

import { useEffect, useState } from "react";
import { getOrCreateCompany } from "@/lib/repo/company";
import { CompanyForm } from "@/components/company/company-form";
import type { Company } from "@/lib/types";

export default function CompanyPage() {
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    getOrCreateCompany().then(setCompany);
  }, []);

  if (!company) return null;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Company Profile
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          This information appears on every invoice you generate.
        </p>
      </div>
      <CompanyForm company={company} />
    </div>
  );
}
