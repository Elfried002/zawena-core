import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useCan } from "@/components/admin/admin-context";
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
import { quoteDetailFn } from "@/lib/admin.functions";
import {
  decideQuoteFn,
  invoiceFromQuoteFn,
  reviseQuoteFn,
  sendQuoteFn,
} from "@/lib/admin-actions.functions";

export const Route = createFileRoute("/_authenticated/admin/sales/quotes/$id")({
  component: QuoteDetailPage,
});

function QuoteDetailPage() {
  const { id } = Route.useParams();
  const can = useCan();
  const queryClient = useQueryClient();
  const detail = useQuery({ queryKey: ["quote", id], queryFn: () => quoteDetailFn({ data: { id } }) });

  function handle(result: { ok: boolean; error?: { message: string } }, message: string) {
    if (!result.ok) {
      toast.error("Action refusée", { description: result.error?.message });
      return;
    }
    toast.success(message);
    void queryClient.invalidateQueries({ queryKey: ["quote", id] });
    void queryClient.invalidateQueries({ queryKey: ["admin-list"] });
  }

  const send = useMutation({
    mutationFn: (lockVersion: number) => sendQuoteFn({ data: { quoteId: id, lockVersion } }),
    onSuccess: (result) => handle(result, "Devis envoyé"),
  });
  const revise = useMutation({
    mutationFn: () => reviseQuoteFn({ data: { quoteId: id } }),
    onSuccess: (result) => handle(result, "Révision créée"),
  });
  const decide = useMutation({
    mutationFn: (decision: "accepted" | "rejected" | "cancelled") =>
      decideQuoteFn({ data: { quoteId: id, decision } }),
    onSuccess: (result) => handle(result, "Décision enregistrée"),
  });
  const toInvoice = useMutation({
    mutationFn: () => invoiceFromQuoteFn({ data: { quoteId: id, dueInDays: 30 } }),
    onSuccess: (result) => handle(result, "Facture créée"),
  });

  if (detail.isPending) return <TableSkeleton rows={5} />;
  if (detail.isError || !detail.data) {
    return <EmptyState title="Devis introuvable" description="Vérifiez le lien ou vos droits d'accès." />;
  }

  const quote = detail.data.quote as Record<string, any>;
  const items = (quote["quote_items"] ?? []) as Array<Record<string, any>>;
  const status = String(quote["status"]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${String(quote["number"])} · ${String(quote["title"])}`}
        description={`Version ${String(quote["version"] ?? 1)}`}
        actions={
          <>
            <Button asChild variant="ghost">
              <Link to="/admin/sales/quotes">Retour</Link>
            </Button>
            <StatusBadge value={status} />
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        {can("quotes.send") && status === "draft" && (
          <Button disabled={send.isPending} onClick={() => send.mutate(Number(quote["lock_version"] ?? 0))}>
            Envoyer au client
          </Button>
        )}
        {can("quotes.update") && ["sent", "viewed"].includes(status) && (
          <>
            <Button variant="outline" disabled={decide.isPending} onClick={() => decide.mutate("accepted")}>
              Marquer accepté
            </Button>
            <Button variant="outline" disabled={decide.isPending} onClick={() => decide.mutate("rejected")}>
              Marquer refusé
            </Button>
            <Button variant="ghost" disabled={revise.isPending} onClick={() => revise.mutate()}>
              Créer une révision
            </Button>
          </>
        )}
        {can("invoices.create") && status === "accepted" && (
          <Button disabled={toInvoice.isPending} onClick={() => toInvoice.mutate()}>
            Générer la facture
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Lignes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune ligne.</p>
            ) : (
              items.map((item) => (
                <div key={String(item["id"])} className="flex items-start justify-between gap-4 text-sm">
                  <span>
                    {String(item["description"])}
                    <span className="text-muted-foreground">
                      {" "}
                      × {String(item["quantity"])}
                    </span>
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatMoney(item["line_total"], quote["currency"])}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Synthèse</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border">
              <DetailRow label="Sous-total">{formatMoney(quote["subtotal"], quote["currency"])}</DetailRow>
              <DetailRow label="Remise">{formatMoney(quote["discount_amount"], quote["currency"])}</DetailRow>
              <DetailRow label="TVA">{formatMoney(quote["tax_amount"], quote["currency"])}</DetailRow>
              <DetailRow label="Total">{formatMoney(quote["total"], quote["currency"])}</DetailRow>
              <DetailRow label="Valide jusqu'au">{formatDate(quote["valid_until"])}</DetailRow>
              <DetailRow label="Envoyé le">{formatDate(quote["sent_at"])}</DetailRow>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique des versions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {detail.data.history.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between text-sm">
              <span>
                {entry.number} · v{entry.version}
              </span>
              <StatusBadge value={entry.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
