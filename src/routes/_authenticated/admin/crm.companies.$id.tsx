import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import {
  DetailRow,
  EmptyState,
  PageHeader,
  StatusBadge,
  TableSkeleton,
  formatDate,
  formatMoney,
} from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { companyDetailFn } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/crm/companies/$id")({
  component: CompanyDetailPage,
});

function CompanyDetailPage() {
  const { id } = Route.useParams();
  const detail = useQuery({ queryKey: ["company", id], queryFn: () => companyDetailFn({ data: { id } }) });

  if (detail.isPending) return <TableSkeleton rows={5} />;
  if (detail.isError || !detail.data) {
    return <EmptyState title="Entreprise introuvable" description="Vérifiez le lien ou vos droits d'accès." />;
  }

  const company = detail.data.company as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={String(company["name"] ?? "Entreprise")}
        description={String(company["industry"] ?? "")}
        actions={
          <Button asChild variant="ghost">
            <Link to="/admin/crm/companies">Retour</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Fiche</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border">
              <DetailRow label="Raison sociale">{String(company["legal_name"] ?? "—")}</DetailRow>
              <DetailRow label="Site web">{String(company["website"] ?? "—")}</DetailRow>
              <DetailRow label="E-mail">{String(company["email"] ?? "—")}</DetailRow>
              <DetailRow label="Téléphone">{String(company["phone"] ?? "—")}</DetailRow>
              <DetailRow label="Ville">
                {[company["city"], company["country"]].filter(Boolean).join(", ") || "—"}
              </DetailRow>
              <DetailRow label="Taille">{String(company["size_range"] ?? "—")}</DetailRow>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contacts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {detail.data.contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun contact rattaché.</p>
            ) : (
              detail.data.contacts.map((row) => (
                <div key={String(row["id"])} className="text-sm">
                  <p className="font-medium">
                    {`${String(row["first_name"] ?? "")} ${String(row["last_name"] ?? "")}`.trim()}
                  </p>
                  <p className="text-muted-foreground">{String(row["email"] ?? row["phone"] ?? "—")}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Opportunités</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {detail.data.opportunities.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune opportunité.</p>
            ) : (
              detail.data.opportunities.map((row) => (
                <div key={String(row["id"])} className="flex items-center justify-between text-sm">
                  <span className="truncate">{String(row["title"] ?? "—")}</span>
                  <span className="font-medium">{formatMoney(row["amount"], row["currency"])}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Devis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {detail.data.quotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun devis.</p>
            ) : (
              detail.data.quotes.map((row) => (
                <Link
                  key={String(row["id"])}
                  to="/admin/sales/quotes/$id"
                  params={{ id: String(row["id"]) }}
                  className="flex items-center justify-between rounded-lg px-1.5 py-1 text-sm hover:bg-muted"
                >
                  <span>{String(row["number"] ?? "—")}</span>
                  <span className="flex items-center gap-2">
                    <StatusBadge value={row["status"]} />
                    <span className="font-medium">{formatMoney(row["total"], row["currency"])}</span>
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Factures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {detail.data.invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune facture.</p>
            ) : (
              detail.data.invoices.map((row) => (
                <Link
                  key={String(row["id"])}
                  to="/admin/finance/invoices/$id"
                  params={{ id: String(row["id"]) }}
                  className="flex items-center justify-between rounded-lg px-1.5 py-1 text-sm hover:bg-muted"
                >
                  <span>{String(row["number"] ?? "—")}</span>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-xs">{formatDate(row["due_date"])}</span>
                    <StatusBadge value={row["status"]} />
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
