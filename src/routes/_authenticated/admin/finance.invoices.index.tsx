import { createFileRoute } from "@tanstack/react-router";

import { ResourceTable } from "@/components/admin/resource-table";
import { PageHeader, StatusBadge, formatDate, formatMoney } from "@/components/admin/ui-bits";

export const Route = createFileRoute("/_authenticated/admin/finance/invoices/")({
  component: InvoicesPage,
});

function InvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Factures" description="Encours, règlements partiels et retards de paiement." />
      <ResourceTable
        resource="invoices"
        searchPlaceholder="Numéro de facture…"
        rowTo={(row) => `/admin/finance/invoices/${String(row["id"])}`}
        filters={[
          {
            key: "status",
            label: "Statut",
            options: [
              { value: "draft", label: "Brouillon" },
              { value: "issued", label: "Émise" },
              { value: "sent", label: "Envoyée" },
              { value: "partially_paid", label: "Partiellement payée" },
              { value: "paid", label: "Payée" },
              { value: "overdue", label: "En retard" },
              { value: "cancelled", label: "Annulée" },
            ],
          },
        ]}
        columns={[
          { key: "number", header: "Numéro" },
          {
            key: "company",
            header: "Client",
            render: (row) => String((row["companies"] as { name?: string } | null)?.name ?? "—"),
          },
          { key: "status", header: "Statut", render: (row) => <StatusBadge value={row["status"]} /> },
          { key: "total", header: "Total", render: (row) => formatMoney(row["total"], row["currency"]) },
          {
            key: "balance",
            header: "Solde dû",
            render: (row) =>
              formatMoney(Number(row["total"] ?? 0) - Number(row["amount_paid"] ?? 0), row["currency"]),
          },
          { key: "due_date", header: "Échéance", render: (row) => formatDate(row["due_date"]) },
        ]}
      />
    </div>
  );
}
