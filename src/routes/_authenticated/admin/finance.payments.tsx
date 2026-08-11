import { createFileRoute } from "@tanstack/react-router";

import { ResourceTable } from "@/components/admin/resource-table";
import { PageHeader, formatDate, formatMoney, statusLabel } from "@/components/admin/ui-bits";

export const Route = createFileRoute("/_authenticated/admin/finance/payments")({
  component: PaymentsPage,
});

function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Paiements" description="Règlements enregistrés, imputés automatiquement aux factures." />
      <ResourceTable
        resource="payments"
        searchPlaceholder="Référence…"
        filters={[
          {
            key: "method",
            label: "Moyen",
            options: [
              { value: "bank_transfer", label: "Virement" },
              { value: "card", label: "Carte" },
              { value: "cash", label: "Espèces" },
              { value: "paypal", label: "PayPal" },
              { value: "stripe", label: "Stripe" },
              { value: "other", label: "Autre" },
            ],
          },
        ]}
        columns={[
          {
            key: "invoice",
            header: "Facture",
            render: (row) => String((row["invoices"] as { number?: string } | null)?.number ?? "—"),
          },
          { key: "amount", header: "Montant", render: (row) => formatMoney(row["amount"], row["currency"]) },
          { key: "method", header: "Moyen", render: (row) => statusLabel(row["method"]) },
          { key: "reference", header: "Référence" },
          { key: "paid_at", header: "Payé le", render: (row) => formatDate(row["paid_at"]) },
        ]}
      />
    </div>
  );
}
