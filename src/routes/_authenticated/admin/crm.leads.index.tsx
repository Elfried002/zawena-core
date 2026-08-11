import { createFileRoute } from "@tanstack/react-router";

import { ResourceTable } from "@/components/admin/resource-table";
import { PageHeader, StatusBadge, formatDate } from "@/components/admin/ui-bits";

export const Route = createFileRoute("/_authenticated/admin/crm/leads/")({
  component: LeadsPage,
});

function LeadsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Prospects"
        description="Toutes les demandes entrantes, qualifiées puis converties en contact, entreprise et opportunité."
      />
      <ResourceTable
        resource="leads"
        searchPlaceholder="Nom, e-mail, entreprise…"
        rowTo={(row) => `/admin/crm/leads/${String(row["id"])}`}
        filters={[
          {
            key: "status",
            label: "Statut",
            options: [
              { value: "new", label: "Nouveau" },
              { value: "contacted", label: "Contacté" },
              { value: "qualified", label: "Qualifié" },
              { value: "unqualified", label: "Non qualifié" },
              { value: "converted", label: "Converti" },
            ],
          },
          {
            key: "source",
            label: "Source",
            options: [
              { value: "website", label: "Site web" },
              { value: "referral", label: "Recommandation" },
              { value: "linkedin", label: "LinkedIn" },
              { value: "email", label: "E-mail" },
              { value: "event", label: "Événement" },
              { value: "other", label: "Autre" },
            ],
          },
        ]}
        columns={[
          { key: "full_name", header: "Prospect" },
          { key: "email", header: "E-mail" },
          { key: "company_name", header: "Entreprise" },
          { key: "status", header: "Statut", render: (row) => <StatusBadge value={row["status"]} /> },
          { key: "score", header: "Score", className: "tabular-nums" },
          { key: "created_at", header: "Reçu le", render: (row) => formatDate(row["created_at"]) },
        ]}
      />
    </div>
  );
}
