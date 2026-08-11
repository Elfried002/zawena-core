import { createFileRoute } from "@tanstack/react-router";

import { ResourceTable } from "@/components/admin/resource-table";
import { PageHeader, statusLabel, formatDateTime } from "@/components/admin/ui-bits";

export const Route = createFileRoute("/_authenticated/admin/crm/activities")({
  component: ActivitiesPage,
});

function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Activités" description="Journal des échanges : appels, e-mails, réunions et démonstrations." />
      <ResourceTable
        resource="activities"
        searchPlaceholder="Objet, contenu…"
        filters={[
          {
            key: "type",
            label: "Type",
            options: [
              { value: "call", label: "Appel" },
              { value: "email", label: "E-mail" },
              { value: "meeting", label: "Réunion" },
              { value: "demo", label: "Démonstration" },
              { value: "note", label: "Note" },
              { value: "follow_up", label: "Relance" },
              { value: "other", label: "Autre" },
            ],
          },
          {
            key: "entity_type",
            label: "Rattachement",
            options: [
              { value: "lead", label: "Prospect" },
              { value: "contact", label: "Contact" },
              { value: "company", label: "Entreprise" },
              { value: "opportunity", label: "Opportunité" },
            ],
          },
        ]}
        columns={[
          { key: "type", header: "Type", render: (row) => statusLabel(row["type"]) },
          { key: "subject", header: "Objet" },
          { key: "entity_type", header: "Rattaché à", render: (row) => statusLabel(row["entity_type"]) },
          { key: "occurred_at", header: "Le", render: (row) => formatDateTime(row["occurred_at"]) },
          { key: "duration_minutes", header: "Durée (min)", className: "tabular-nums" },
        ]}
      />
    </div>
  );
}
