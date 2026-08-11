import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { useAdmin } from "@/components/admin/admin-context";
import {
  EmptyState,
  KpiCard,
  PageHeader,
  StatusBadge,
  TableSkeleton,
  formatDate,
  formatDateTime,
  formatMoney,
} from "@/components/admin/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminDashboardFn } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardPage,
});

function DashboardPage() {
  const identity = useAdmin();
  const query = useQuery({ queryKey: ["admin-dashboard"], queryFn: () => adminDashboardFn() });

  const firstName = (identity.fullName ?? identity.email ?? "").split(" ")[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={firstName ? `Bonjour ${firstName}` : "Tableau de bord"}
        description="Vue consolidée de l'activité commerciale, financière, support et éditoriale."
      />

      {query.isPending ? (
        <TableSkeleton rows={4} />
      ) : query.isError || !query.data ? (
        <EmptyState
          title="Indicateurs indisponibles"
          description="Les données n'ont pas pu être chargées. Réessayez dans quelques instants."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <KpiCard label="Nouveaux prospects" value={query.data.kpis.newLeads} to="/admin/crm/leads" />
            <KpiCard
              label="Demandes de devis"
              value={query.data.kpis.openQuoteRequests}
              hint="À traiter"
              to="/admin/sales/requests"
            />
            <KpiCard
              label="Opportunités ouvertes"
              value={query.data.kpis.openOpportunities}
              to="/admin/sales/pipeline"
            />
            <KpiCard
              label="Factures en cours"
              value={query.data.kpis.outstandingInvoices}
              to="/admin/finance/invoices"
            />
            <KpiCard label="Tickets ouverts" value={query.data.kpis.openTickets} to="/admin/support/tickets" />
            <KpiCard label="Contenus en attente" value={query.data.kpis.draftContent} to="/admin/content/pages" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Demandes de devis à traiter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {query.data.attention.quoteRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune demande en attente.</p>
                ) : (
                  query.data.attention.quoteRequests.map((row) => (
                    <Link
                      key={String(row["id"])}
                      to="/admin/sales/requests"
                      className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted"
                    >
                      <span className="text-sm">
                        {String(row["full_name"] ?? "—")}
                        {row["company_name"] ? ` · ${String(row["company_name"])}` : ""}
                      </span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {formatDate(row["created_at"])}
                        <StatusBadge value={row["status"]} />
                      </span>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tickets prioritaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {query.data.attention.tickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun ticket en attente.</p>
                ) : (
                  query.data.attention.tickets.map((row) => (
                    <Link
                      key={String(row["id"])}
                      to="/admin/support/tickets/$id"
                      params={{ id: String(row["id"]) }}
                      className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted"
                    >
                      <span className="truncate text-sm">
                        {String(row["number"] ?? "")} · {String(row["subject"] ?? "")}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <StatusBadge value={row["priority"]} />
                        <StatusBadge value={row["status"]} />
                      </span>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Factures à recouvrer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {query.data.attention.overdueInvoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun encours échu.</p>
                ) : (
                  query.data.attention.overdueInvoices.map((row) => (
                    <Link
                      key={String(row["id"])}
                      to="/admin/finance/invoices/$id"
                      params={{ id: String(row["id"]) }}
                      className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted"
                    >
                      <span className="text-sm">{String(row["number"] ?? "—")}</span>
                      <span className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Échéance {formatDate(row["due_date"])}</span>
                        <span className="font-medium text-foreground">
                          {formatMoney(
                            Number(row["total"] ?? 0) - Number(row["amount_paid"] ?? 0),
                            row["currency"],
                          )}
                        </span>
                      </span>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tâches à échéance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {query.data.attention.dueTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune tâche urgente.</p>
                ) : (
                  query.data.attention.dueTasks.map((row) => (
                    <div
                      key={String(row["id"])}
                      className="flex items-center justify-between rounded-lg px-2 py-2"
                    >
                      <span className="truncate text-sm">{String(row["title"] ?? "—")}</span>
                      <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                        {formatDate(row["due_at"])}
                        <StatusBadge value={row["priority"]} />
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activité récente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {query.data.recent.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun événement enregistré.</p>
              ) : (
                query.data.recent.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between py-1 text-sm">
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">{entry.module}</span> · {entry.action}
                      {entry.tableName ? ` · ${entry.tableName}` : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDateTime(entry.createdAt)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
