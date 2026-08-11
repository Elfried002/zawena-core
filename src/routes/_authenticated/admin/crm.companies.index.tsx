import { createFileRoute } from "@tanstack/react-router";

import { ResourceTable } from "@/components/admin/resource-table";
import { PageHeader, formatDate } from "@/components/admin/ui-bits";

export const Route = createFileRoute("/_authenticated/admin/crm/companies/")({
  component: CompaniesPage,
});

function CompaniesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Entreprises" description="Comptes clients et prospects, avec leurs contacts et encours." />
      <ResourceTable
        resource="companies"
        searchPlaceholder="Nom, e-mail, secteur…"
        rowTo={(row) => `/admin/crm/companies/${String(row["id"])}`}
        columns={[
          { key: "name", header: "Entreprise" },
          { key: "industry", header: "Secteur" },
          { key: "email", header: "E-mail" },
          { key: "phone", header: "Téléphone" },
          { key: "city", header: "Ville" },
          { key: "created_at", header: "Créée le", render: (row) => formatDate(row["created_at"]) },
        ]}
      />
    </div>
  );
}
