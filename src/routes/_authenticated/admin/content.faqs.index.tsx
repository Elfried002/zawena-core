import { createFileRoute, Link } from "@tanstack/react-router";

import { useCan } from "@/components/admin/admin-context";
import { ResourceTable } from "@/components/admin/resource-table";
import { PageHeader, StatusBadge } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/content/faqs/")({
  component: FaqListPage,
});

function FaqListPage() {
  const can = useCan();
  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQ"
        description="Questions fréquentes, classées par catégorie et rattachables à un service."
        actions={
          can("faqs.create") ? (
            <Button asChild>
              <Link to="/admin/content/faqs/$id" params={{ id: "new" }}>
                Nouvelle question
              </Link>
            </Button>
          ) : null
        }
      />
      <ResourceTable
        resource="faqs"
        searchPlaceholder="Question…"
        rowTo={(row) => `/admin/content/faqs/${String(row["id"])}`}
        filters={[
          {
            key: "status",
            label: "Statut",
            options: [
              { value: "draft", label: "Brouillon" },
              { value: "review", label: "Relecture" },
              { value: "published", label: "Publié" },
              { value: "archived", label: "Archivé" },
            ],
          },
        ]}
        columns={[
          { key: "question", header: "Question" },
          { key: "category", header: "Catégorie" },
          { key: "sort_order", header: "Ordre" },
          { key: "status", header: "Statut", render: (row) => <StatusBadge value={row["status"]} /> },
        ]}
      />
    </div>
  );
}
