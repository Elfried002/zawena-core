import { createFileRoute } from "@tanstack/react-router";

import { ContentForm } from "@/components/admin/content-form";
import { PageHeader } from "@/components/admin/ui-bits";

export const Route = createFileRoute("/_authenticated/admin/content/faqs/$id")({
  component: FaqDetailPage,
});

function FaqDetailPage() {
  const { id } = Route.useParams();
  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQ"
        description={id === "new" ? "Création d'une question." : "Édition et publication."}
      />
      <ContentForm entity="faqs" id={id} />
    </div>
  );
}
