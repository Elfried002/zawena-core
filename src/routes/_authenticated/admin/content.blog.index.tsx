import { createFileRoute, Link } from "@tanstack/react-router";

import { useCan } from "@/components/admin/admin-context";
import { ResourceTable } from "@/components/admin/resource-table";
import { PageHeader, StatusBadge, formatDateTime } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/content/blog/")({
  component: ContentListPage,
});

function ContentListPage() {
  const can = useCan();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog"
        description="Articles, workflow éditorial et SEO."
        actions={
          can("blog_posts.create") ? (
            <Button asChild>
              <Link to="/admin/content/blog/$id" params={{ id: "new" }}>
                Nouveau
              </Link>
            </Button>
          ) : null
        }
      />
      <ResourceTable
        resource="blog_posts"
        searchPlaceholder="Titre, slug…"
        rowTo={(row) => `/admin/content/blog/${String(row["id"])}`}
        filters={[
          {
            key: "status",
            label: "Statut",
            options: [
              { value: "draft", label: "Brouillon" },
              { value: "review", label: "Relecture" },
              { value: "scheduled", label: "Programmé" },
              { value: "published", label: "Publié" },
              { value: "archived", label: "Archivé" },
            ],
          },
        ]}
        columns={[
          { key: "title", header: "Titre" },
          { key: "slug", header: "Slug" },
          { key: "reading_minutes", header: "Lecture (min)" },
          { key: "status", header: "Statut", render: (row) => <StatusBadge value={row["status"]} /> },
          { key: "updated_at", header: "Modifié le", render: (row) => formatDateTime(row["updated_at"] ?? row["created_at"]) },
        ]}
      />
    </div>
  );
}
