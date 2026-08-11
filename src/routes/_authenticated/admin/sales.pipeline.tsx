import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { EmptyState, PageHeader, TableSkeleton, formatDate, formatMoney } from "@/components/admin/ui-bits";
import { pipelineBoardFn } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/sales/pipeline")({
  component: PipelinePage,
});

function PipelinePage() {
  const query = useQuery({ queryKey: ["pipeline-board"], queryFn: () => pipelineBoardFn() });

  if (query.isPending) return <TableSkeleton rows={4} />;
  if (query.isError || !query.data) {
    return <EmptyState title="Pipeline indisponible" description="Vérifiez vos droits d'accès commercial." />;
  }

  const { stages, opportunities } = query.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline commercial"
        description="Opportunités ouvertes par étape, avec montants pondérés par probabilité."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stages.map((stage) => {
          const items = opportunities.filter((row) => row["stage_id"] === stage.id);
          const total = items.reduce((sum, row) => sum + Number(row["amount"] ?? 0), 0);
          return (
            <section key={stage.id} className="rounded-2xl border border-border bg-card p-4">
              <header className="flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold">{stage.name}</h2>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </header>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatMoney(total, items[0]?.["currency"] ?? "XOF")} · {Math.round(stage.probability * 100)}%
              </p>
              <div className="mt-3 space-y-2">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Aucune opportunité.</p>
                ) : (
                  items.map((row) => (
                    <article key={String(row["id"])} className="rounded-xl bg-muted/40 p-3">
                      <p className="truncate text-sm font-medium">{String(row["title"] ?? "—")}</p>
                      <p className="text-xs text-muted-foreground">
                        {String((row["companies"] as { name?: string } | null)?.name ?? "—")}
                      </p>
                      <p className="mt-1 flex items-center justify-between text-xs">
                        <span className="font-medium">{formatMoney(row["amount"], row["currency"])}</span>
                        <span className="text-muted-foreground">{formatDate(row["expected_close_date"])}</span>
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
