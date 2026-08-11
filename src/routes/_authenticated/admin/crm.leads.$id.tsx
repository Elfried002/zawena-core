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
  formatDateTime,
  formatMoney,
  statusLabel,
} from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { leadDetailFn, pipelineStagesFn } from "@/lib/admin.functions";
import { convertLeadFn, logActivityFn, updateLeadStatusFn } from "@/lib/admin-actions.functions";

export const Route = createFileRoute("/_authenticated/admin/crm/leads/$id")({
  component: LeadDetailPage,
});

const NEXT_STATUS = [
  { value: "contacted", label: "Marquer contacté" },
  { value: "qualified", label: "Marquer qualifié" },
  { value: "unqualified", label: "Marquer non qualifié" },
];

function LeadDetailPage() {
  const { id } = Route.useParams();
  const can = useCan();
  const queryClient = useQueryClient();

  const detail = useQuery({ queryKey: ["lead", id], queryFn: () => leadDetailFn({ data: { id } }) });
  const stages = useQuery({
    queryKey: ["pipeline-stages"],
    queryFn: () => pipelineStagesFn(),
    enabled: can("opportunities.read"),
  });

  const [note, setNote] = useState("");
  const [stageId, setStageId] = useState("");
  const [amount, setAmount] = useState("");

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["lead", id] });
    void queryClient.invalidateQueries({ queryKey: ["admin-list"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  }

  const setStatus = useMutation({
    mutationFn: (status: string) =>
      updateLeadStatusFn({ data: { leadId: id, status, ...(note ? { note } : {}) } }),
    onSuccess: (result) => {
      if (!result.ok) { toast.error("Action refusée", { description: result.error.message }); return; }
      toast.success("Statut mis à jour");
      setNote("");
      refresh();
    },
  });

  const logNote = useMutation({
    mutationFn: () =>
      logActivityFn({
        data: { entityType: "lead", entityId: id, type: "note", body: note, subject: "Note interne" },
      }),
    onSuccess: (result) => {
      if (!result.ok) { toast.error("Action refusée", { description: result.error.message }); return; }
      toast.success("Note enregistrée");
      setNote("");
      refresh();
    },
  });

  const convert = useMutation({
    mutationFn: () =>
      convertLeadFn({
        data: {
          leadId: id,
          stageId,
          ...(amount ? { amount: Number(amount) } : {}),
        },
      }),
    onSuccess: (result) => {
      if (!result.ok) { toast.error("Conversion impossible", { description: result.error.message }); return; }
      toast.success("Prospect converti", { description: "Contact, entreprise et opportunité créés." });
      refresh();
    },
  });

  if (detail.isPending) return <TableSkeleton rows={5} />;
  if (detail.isError || !detail.data) {
    return (
      <EmptyState
        title="Prospect introuvable"
        description="Il a peut-être été supprimé, ou vous n'avez pas les droits d'accès."
      />
    );
  }

  const lead = detail.data.lead as Record<string, unknown>;
  const converted = lead["status"] === "converted";

  return (
    <div className="space-y-6">
      <PageHeader
        title={String(lead["full_name"] ?? "Prospect")}
        description={`${String(lead["email"] ?? "")}${lead["company_name"] ? ` · ${String(lead["company_name"])}` : ""}`}
        actions={
          <>
            <Button asChild variant="ghost">
              <Link to="/admin/crm/leads">Retour</Link>
            </Button>
            <StatusBadge value={lead["status"]} />
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Informations</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border">
              <DetailRow label="Source">{statusLabel(lead["source"])}</DetailRow>
              <DetailRow label="Score">{String(lead["score"] ?? 0)}</DetailRow>
              <DetailRow label="Téléphone">{String(lead["phone"] ?? "—")}</DetailRow>
              <DetailRow label="Service demandé">
                {String((lead["services"] as { title?: string } | null)?.title ?? "—")}
              </DetailRow>
              <DetailRow label="Reçu le">{formatDateTime(lead["created_at"])}</DetailRow>
            </dl>
            {typeof lead["message"] === "string" && lead["message"] && (
              <p className="mt-4 whitespace-pre-line rounded-xl bg-muted/50 p-4 text-sm">
                {lead["message"]}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Qualification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note">Note (optionnelle)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                placeholder="Contexte de l'échange…"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {can("leads.update") &&
                !converted &&
                NEXT_STATUS.map((option) => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant="outline"
                    disabled={setStatus.isPending || lead["status"] === option.value}
                    onClick={() => setStatus.mutate(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              {can("activities.create") && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!note.trim() || logNote.isPending}
                  onClick={() => logNote.mutate()}
                >
                  Enregistrer la note
                </Button>
              )}
            </div>

            {can("leads.update") && !converted && (
              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-sm font-medium">Convertir en opportunité</p>
                <Select value={stageId} onValueChange={setStageId}>
                  <SelectTrigger aria-label="Étape du pipeline">
                    <SelectValue placeholder="Étape du pipeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {(stages.data ?? []).map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Montant estimé"
                  aria-label="Montant estimé"
                />
                <Button
                  className="w-full"
                  disabled={!stageId || convert.isPending}
                  onClick={() => convert.mutate()}
                >
                  Convertir le prospect
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.data.activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune activité enregistrée.</p>
            ) : (
              detail.data.activities.map((row) => (
                <div key={String(row["id"])} className="border-l-2 border-border pl-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    {statusLabel(row["type"])} · {formatDateTime(row["occurred_at"])}
                  </p>
                  <p className="text-sm font-medium">{String(row["subject"] ?? "—")}</p>
                  {typeof row["body"] === "string" && row["body"] && (
                    <p className="mt-0.5 whitespace-pre-line text-sm text-muted-foreground">{row["body"]}</p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
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
              <CardTitle className="text-base">Tâches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {detail.data.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune tâche.</p>
              ) : (
                detail.data.tasks.map((row) => (
                  <div key={String(row["id"])} className="flex items-center justify-between text-sm">
                    <span className="truncate">{String(row["title"] ?? "—")}</span>
                    <StatusBadge value={row["status"]} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
