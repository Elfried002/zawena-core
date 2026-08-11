import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EmptyState, KpiCard, PageHeader, TableSkeleton } from "@/components/admin/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsOverviewFn } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AnalyticsPage,
});

const EVENT_LABEL: Record<string, string> = {
  page_view: "Pages vues",
  quote_request_submitted: "Demandes de devis",
  contact_submitted: "Formulaires contact",
  service_viewed: "Services consultés",
  project_viewed: "Réalisations consultées",
};

function AnalyticsPage() {
  const query = useQuery({ queryKey: ["analytics"], queryFn: () => analyticsOverviewFn() });

  if (query.isPending) return <TableSkeleton rows={6} />;
  if (query.isError || !query.data) {
    return (
      <EmptyState
        title="Analytics indisponibles"
        description="La permission analytics.read est requise pour consulter ces données."
      />
    );
  }

  const { total, days, events, paths, timeline } = query.data;
  const peak = Math.max(1, ...timeline.map((point) => point.value));
  const conversions = events
    .filter((event) => event.label.includes("quote") || event.label.includes("contact"))
    .reduce((sum, event) => sum + event.value, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description={`Événements métier anonymisés sur les ${days} derniers jours.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Événements" value={total} hint={`Fenêtre : ${days} jours`} />
        <KpiCard label="Conversions" value={conversions} hint="Devis + contacts" />
        <KpiCard
          label="Taux de conversion"
          value={total ? `${((conversions / total) * 100).toFixed(1)} %` : "—"}
          hint="Conversions / événements"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Volume quotidien</CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun événement enregistré.</p>
          ) : (
            <div className="flex h-40 items-end gap-1">
              {timeline.map((point) => (
                <div key={point.label} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-primary/70"
                    style={{ height: `${Math.round((point.value / peak) * 100)}%` }}
                    title={`${point.label} : ${point.value}`}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Événements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {events.length === 0 && <p className="text-sm text-muted-foreground">Aucune donnée.</p>}
            {events.map((event) => (
              <div key={event.label} className="flex items-center justify-between text-sm">
                <span>{EVENT_LABEL[event.label] ?? event.label}</span>
                <span className="tabular-nums font-medium">{event.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pages les plus vues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {paths.length === 0 && <p className="text-sm text-muted-foreground">Aucune donnée.</p>}
            {paths.map((path) => (
              <div key={path.label} className="flex items-center justify-between gap-4 text-sm">
                <span className="truncate text-muted-foreground">{path.label}</span>
                <span className="tabular-nums font-medium">{path.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
