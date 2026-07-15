import { prisma } from "@/lib/db";
import { CompanyForm } from "@/components/company/company-form";

export default async function CompanyPage() {
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: { name: "My Company", state: "Gujarat", invoicePrefix: "INV" },
    });
  }

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
