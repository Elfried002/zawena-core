import { createFileRoute } from "@tanstack/react-router";

import { ContentForm } from "@/components/admin/content-form";
import { PageHeader } from "@/components/admin/ui-bits";

export const Route = createFileRoute("/_authenticated/admin/content/services/$id")({
  component: ContentDetailPage,
});

function ContentDetailPage() {
  const { id } = Route.useParams();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description={id === "new" ? "Création d'un brouillon." : "Édition et workflow de publication."}
      />
      <ContentForm entity="services" id={id} />
    </div>
  );
}
