import { createFileRoute } from "@tanstack/react-router";

import { ResourceTable } from "@/components/admin/resource-table";
import { PageHeader, formatDate } from "@/components/admin/ui-bits";

export const Route = createFileRoute("/_authenticated/admin/crm/contacts")({
  component: ContactsPage,
});

function ContactsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Contacts" description="Interlocuteurs rattachés aux entreprises du portefeuille." />
      <ResourceTable
        resource="contacts"
        searchPlaceholder="Nom, e-mail…"
        columns={[
          {
            key: "first_name",
            header: "Contact",
            render: (row) => `${String(row["first_name"] ?? "")} ${String(row["last_name"] ?? "")}`.trim() || "—",
          },
          {
            key: "company",
            header: "Entreprise",
            render: (row) => String((row["companies"] as { name?: string } | null)?.name ?? "—"),
          },
          { key: "job_title", header: "Fonction" },
          { key: "email", header: "E-mail" },
          { key: "phone", header: "Téléphone" },
          { key: "created_at", header: "Créé le", render: (row) => formatDate(row["created_at"]) },
        ]}
      />
    </div>
  );
}
