import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useCan } from "@/components/admin/admin-context";
import { ResourceTable } from "@/components/admin/resource-table";
import { PageHeader, StatusBadge, formatDate } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { reviewQuoteRequestFn } from "@/lib/admin-actions.functions";

export const Route = createFileRoute("/_authenticated/admin/sales/requests")({
  component: QuoteRequestsPage,
});

function QuoteRequestsPage() {
  const can = useCan();
  const queryClient = useQueryClient();

  const review = useMutation({
    mutationFn: (input: { requestId: string; status: string }) => reviewQuoteRequestFn({ data: input }),
    onSuccess: (result) => {
      if (!result.ok) { toast.error("Action refusée", { description: result.error.message }); return; }
      toast.success("Demande mise à jour");
      void queryClient.invalidateQueries({ queryKey: ["admin-list"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Demandes de devis" description="Demandes entrantes du site public, à qualifier puis chiffrer." />
      <ResourceTable
        resource="quote_requests"
        searchPlaceholder="Nom, e-mail, entreprise…"
        filters={[
          {
            key: "status",
            label: "Statut",
            options: [
              { value: "new", label: "Nouveau" },
              { value: "reviewing", label: "En analyse" },
              { value: "qualified", label: "Qualifié" },
              { value: "quote_created", label: "Devis créé" },
              { value: "declined", label: "Refusé" },
              { value: "archived", label: "Archivé" },
            ],
          },
        ]}
        columns={[
          { key: "full_name", header: "Demandeur" },
          { key: "company_name", header: "Entreprise" },
          {
            key: "service",
            header: "Service",
            render: (row: Record<string, any>) => String((row["services"] as { title?: string } | null)?.title ?? "—"),
          },
          { key: "budget_range", header: "Budget" },
          { key: "status", header: "Statut", render: (row: Record<string, any>) => <StatusBadge value={row["status"]} /> },
          { key: "created_at", header: "Reçu le", render: (row: Record<string, any>) => formatDate(row["created_at"]) },
          {
            key: "actions",
            header: "",
            render: (row: Record<string, any>) =>
              can("quote_requests.update") ? (
                <div className="flex gap-1.5">
                  {row["status"] === "new" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={review.isPending}
                      onClick={() => review.mutate({ requestId: String(row["id"]), status: "reviewing" })}
                    >
                      Analyser
                    </Button>
                  )}
                  {row["status"] === "reviewing" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={review.isPending}
                      onClick={() => review.mutate({ requestId: String(row["id"]), status: "qualified" })}
                    >
                      Qualifier
                    </Button>
                  )}
                </div>
              ) : null,
          },
        ]}
      />
    </div>
  );
}
