import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ResourceTable } from "@/components/admin/resource-table";
import { PageHeader, StatusBadge, formatDateTime } from "@/components/admin/ui-bits";
import { useCan } from "@/components/admin/admin-context";
import { Button } from "@/components/ui/button";
import { updateTaskStatusFn } from "@/lib/admin-actions.functions";

export const Route = createFileRoute("/_authenticated/admin/crm/tasks")({
  component: TasksPage,
});

function TasksPage() {
  const can = useCan();
  const queryClient = useQueryClient();

  const complete = useMutation({
    mutationFn: (taskId: string) => updateTaskStatusFn({ data: { taskId, status: "done" } }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error("Action refusée", { description: result.error.message });
        return;
      }
      toast.success("Tâche terminée");
      void queryClient.invalidateQueries({ queryKey: ["admin-list"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Tâches" description="Actions internes rattachées aux prospects, devis et tickets." />
      <ResourceTable
        resource="tasks"
        searchPlaceholder="Titre, description…"
        filters={[
          {
            key: "status",
            label: "Statut",
            options: [
              { value: "todo", label: "À faire" },
              { value: "in_progress", label: "En cours" },
              { value: "done", label: "Terminé" },
              { value: "cancelled", label: "Annulé" },
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
          { key: "title", header: "Tâche" },
          { key: "status", header: "Statut", render: (row) => <StatusBadge value={row["status"]} /> },
          { key: "priority", header: "Priorité", render: (row) => <StatusBadge value={row["priority"]} /> },
          { key: "due_at", header: "Échéance", render: (row) => formatDateTime(row["due_at"]) },
          {
            key: "actions",
            header: "",
            render: (row) =>
              can("tasks.update") && row["status"] !== "done" ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={complete.isPending}
                  onClick={() => complete.mutate(String(row["id"]))}
                >
                  Terminer
                </Button>
              ) : null,
          },
        ]}
      />
    </div>
  );
}
