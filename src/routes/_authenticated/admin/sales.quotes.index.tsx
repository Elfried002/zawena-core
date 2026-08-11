import { createFileRoute } from "@tanstack/react-router";

import { ResourceTable } from "@/components/admin/resource-table";
import { PageHeader, StatusBadge, formatDate, formatMoney } from "@/components/admin/ui-bits";

export const Route = createFileRoute("/_authenticated/admin/sales/quotes/")({
  component: QuotesPage,
});

function QuotesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Devis" description="Devis chiffrés, envoyés, révisés puis acceptés ou refusés." />
      <ResourceTable
        resource="quotes"
        searchPlaceholder="Numéro, intitulé…"
        rowTo={(row) => `/admin/sales/quotes/${String(row["id"])}`}
        filters={[
          {
            key: "status",
            label: "Statut",
            options: [
              { value: "draft", label: "Brouillon" },
              { value: "sent", label: "Envoyé" },
              { value: "viewed", label: "Consulté" },
              { value: "accepted", label: "Accepté" },
              { value: "rejected", label: "Rejeté" },
              { value: "expired", label: "Expiré" },
              { value: "cancelled", label: "Annulé" },
            ],
          },
        ]}
        columns={[
          { key: "number", header: "Numéro" },
          { key: "title", header: "Intitulé" },
          {
            key: "company",
            header: "Client",
            render: (row) => String((row["companies"] as { name?: string } | null)?.name ?? "—"),
          },
          { key: "status", header: "Statut", render: (row) => <StatusBadge value={row["status"]} /> },
          {
            key: "total",
            header: "Montant",
            render: (row) => formatMoney(row["total"], row["currency"]),
          },
          { key: "valid_until", header: "Valide jusqu'au", render: (row) => formatDate(row["valid_until"]) },
        ]}
      />
    </div>
  );
}
