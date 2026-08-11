import { createFileRoute } from "@tanstack/react-router";

import { ResourceTable } from "@/components/admin/resource-table";
import { PageHeader, StatusBadge, formatDateTime } from "@/components/admin/ui-bits";

export const Route = createFileRoute("/_authenticated/admin/support/tickets/")({
  component: TicketsPage,
});

function TicketsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Tickets" description="Demandes support, priorisées et suivies jusqu'à la clôture." />
      <ResourceTable
        resource="tickets"
        searchPlaceholder="Numéro, sujet, e-mail…"
        rowTo={(row) => `/admin/support/tickets/${String(row["id"])}`}
        filters={[
          {
            key: "status",
            label: "Statut",
            options: [
              { value: "open", label: "Ouvert" },
              { value: "assigned", label: "Assigné" },
              { value: "in_progress", label: "En cours" },
              { value: "waiting_customer", label: "Attente client" },
              { value: "pending", label: "En attente" },
              { value: "resolved", label: "Résolu" },
              { value: "closed", label: "Clôturé" },
            ],
          },
          {
            key: "priority",
            label: "Priorité",
            options: [
              { value: "urgent", label: "Urgent" },
              { value: "high", label: "Haute" },
              { value: "medium", label: "Moyenne" },
              { value: "low", label: "Basse" },
            ],
          },
        ]}
        columns={[
          { key: "number", header: "N°" },
          { key: "subject", header: "Sujet" },
          { key: "status", header: "Statut", render: (row) => <StatusBadge value={row["status"]} /> },
          { key: "priority", header: "Priorité", render: (row) => <StatusBadge value={row["priority"]} /> },
          { key: "requester_email", header: "Demandeur" },
          { key: "created_at", header: "Créé le", render: (row) => formatDateTime(row["created_at"]) },
        ]}
      />
    </div>
  );
}
