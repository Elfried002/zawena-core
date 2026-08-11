import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
  statusLabel,
} from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { invoiceDetailFn } from "@/lib/admin.functions";
import { changeInvoiceStatusFn, recordPaymentFn } from "@/lib/admin-actions.functions";

export const Route = createFileRoute("/_authenticated/admin/finance/invoices/$id")({
  component: InvoiceDetailPage,
});

function InvoiceDetailPage() {
  const { id } = Route.useParams();
  const can = useCan();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");

  const detail = useQuery({ queryKey: ["invoice", id], queryFn: () => invoiceDetailFn({ data: { id } }) });

  function handle(result: { ok: boolean; error?: { message: string } }, message: string) {
    if (!result.ok) return toast.error("Action refusée", { description: result.error?.message });
    toast.success(message);
    setAmount("");
    setReference("");
    void queryClient.invalidateQueries({ queryKey: ["invoice", id] });
    void queryClient.invalidateQueries({ queryKey: ["admin-list"] });
  }

  const changeStatus = useMutation({
    mutationFn: (status: string) => changeInvoiceStatusFn({ data: { invoiceId: id, status } }),
    onSuccess: (result) => handle(result, "Statut mis à jour"),
  });

  const pay = useMutation({
    mutationFn: () =>
      recordPaymentFn({
        data: {
          invoiceId: id,
          amount: Number(amount),
          method: "bank_transfer",
          ...(reference ? { reference } : {}),
        },
      }),
    onSuccess: (result) => handle(result, "Paiement enregistré"),
  });

  if (detail.isPending) return <TableSkeleton rows={5} />;
  if (detail.isError || !detail.data) {
    return <EmptyState title="Facture introuvable" description="Vérifiez le lien ou vos droits d'accès." />;
  }

  const invoice = detail.data.invoice as Record<string, any>;
  const items = (invoice["invoice_items"] ?? []) as Array<Record<string, any>>;
  const balance = Number(invoice["total"] ?? 0) - Number(invoice["amount_paid"] ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Facture ${String(invoice["number"])}`}
        description={`Émise le ${formatDate(invoice["issue_date"])}`}
        actions={
          <>
            <Button asChild variant="ghost">
              <Link to="/admin/finance/invoices">Retour</Link>
            </Button>
            <StatusBadge value={invoice["status"]} />
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        {can("invoices.send") && ["draft", "issued"].includes(String(invoice["status"])) && (
          <Button disabled={changeStatus.isPending} onClick={() => changeStatus.mutate("sent")}>
            Marquer envoyée
          </Button>
        )}
        {can("invoices.update") && String(invoice["status"]) === "draft" && (
          <Button variant="outline" disabled={changeStatus.isPending} onClick={() => changeStatus.mutate("issued")}>
            Émettre
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Lignes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((item) => (
              <div key={String(item["id"])} className="flex items-start justify-between gap-4 text-sm">
                <span>
                  {String(item["description"])}
                  <span className="text-muted-foreground"> × {String(item["quantity"])}</span>
                </span>
                <span className="shrink-0 font-medium">
                  {formatMoney(item["line_total"], invoice["currency"])}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Règlement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="divide-y divide-border">
              <DetailRow label="Total">{formatMoney(invoice["total"], invoice["currency"])}</DetailRow>
              <DetailRow label="Encaissé">{formatMoney(invoice["amount_paid"], invoice["currency"])}</DetailRow>
              <DetailRow label="Solde dû">{formatMoney(balance, invoice["currency"])}</DetailRow>
              <DetailRow label="Échéance">{formatDate(invoice["due_date"])}</DetailRow>
            </dl>

            {can("payments.create") && balance > 0 && (
              <div className="space-y-3 border-t border-border pt-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant reçu</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={0}
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Référence</Label>
                  <Input
                    id="reference"
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={!amount || pay.isPending}
                  onClick={() => pay.mutate()}
                >
                  Enregistrer le paiement
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paiements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {detail.data.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun paiement enregistré.</p>
          ) : (
            detail.data.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between text-sm">
                <span>
                  {statusLabel(payment.method)} · {formatDate(payment.paid_at)}
                </span>
                <span className="font-medium">{formatMoney(payment.amount, payment.currency)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
