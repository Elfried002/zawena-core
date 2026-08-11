import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader, TableSkeleton, formatDateTime } from "@/components/admin/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { myNotificationsFn } from "@/lib/admin.functions";
import { markAllNotificationsReadFn, markNotificationReadFn } from "@/lib/admin-actions.functions";

export const Route = createFileRoute("/_authenticated/admin/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const queryClient = useQueryClient();
  const [onlyUnread, setOnlyUnread] = useState(false);

  const query = useQuery({
    queryKey: ["notifications", onlyUnread],
    queryFn: () => myNotificationsFn({ data: { onlyUnread } }),
  });

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  const markOne = useMutation({
    mutationFn: (id: string) => markNotificationReadFn({ data: { id } }),
    onSuccess: refresh,
  });

  const markAll = useMutation({
    mutationFn: () => markAllNotificationsReadFn(),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error("Action impossible", { description: result.error.message });
        return;
      }
      toast.success("Notifications marquées comme lues");
      refresh();
    },
  });

  const items = query.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Alertes opérationnelles : prospects, devis, factures, tickets et tâches."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setOnlyUnread((value) => !value)}>
              {onlyUnread ? "Voir tout" : "Non lues seulement"}
            </Button>
            <Button size="sm" disabled={markAll.isPending} onClick={() => markAll.mutate()}>
              Tout marquer comme lu
            </Button>
          </div>
        }
      />

      {query.isPending ? (
        <TableSkeleton rows={5} />
      ) : items.length === 0 ? (
        <EmptyState title="Aucune notification" description="Les nouvelles alertes apparaîtront ici." />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                  {!item.read_at && <Badge className="border-0 bg-primary/10 text-primary">Nouveau</Badge>}
                </div>
                {item.body && <p className="text-sm text-muted-foreground">{item.body}</p>}
                <p className="text-xs text-muted-foreground">{formatDateTime(item.created_at)}</p>
              </div>
              <div className="flex gap-2">
                {item.link && (
                  <Button asChild size="sm" variant="outline">
                    <a href={item.link}>Ouvrir</a>
                  </Button>
                )}
                {!item.read_at && (
                  <Button size="sm" variant="ghost" onClick={() => markOne.mutate(item.id)}>
                    Marquer lu
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
