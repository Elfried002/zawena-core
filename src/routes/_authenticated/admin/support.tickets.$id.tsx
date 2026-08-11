import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
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
} from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ticketDetailFn } from "@/lib/admin.functions";
import {
  assignTicketFn,
  changeTicketStatusFn,
  replyTicketFn,
} from "@/lib/admin-actions.functions";
import { ticketTransitions } from "@/services/core/state-machines";

export const Route = createFileRoute("/_authenticated/admin/support/tickets/$id")({
  component: TicketDetailPage,
});

function TicketDetailPage() {
  const { id } = Route.useParams();
  const can = useCan();
  const queryClient = useQueryClient();

  const detail = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => ticketDetailFn({ data: { id } }),
  });

  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [assignee, setAssignee] = useState("");

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["ticket", id] });
    void queryClient.invalidateQueries({ queryKey: ["admin-list"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  }

  const reply = useMutation({
    mutationFn: () => replyTicketFn({ data: { ticketId: id, body, isInternal: internal, attachmentMediaIds: [] } }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error("Réponse refusée", { description: result.error.message });
        return;
      }
      toast.success(internal ? "Note interne ajoutée" : "Réponse envoyée au client");
      setBody("");
      refresh();
    },
  });

  const assign = useMutation({
    mutationFn: () => assignTicketFn({ data: { ticketId: id, assigneeId: assignee } }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error("Assignation refusée", { description: result.error.message });
        return;
      }
      toast.success("Ticket assigné");
      refresh();
    },
  });

  const changeStatus = useMutation({
    mutationFn: (status: string) => changeTicketStatusFn({ data: { ticketId: id, status } }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error("Transition refusée", { description: result.error.message });
        return;
      }
      toast.success("Statut mis à jour");
      refresh();
    },
  });

  if (detail.isPending) return <TableSkeleton rows={5} />;
  if (detail.isError || !detail.data) {
    return (
      <EmptyState
        title="Ticket introuvable"
        description="Il a peut-être été supprimé, ou vous n'avez pas les droits d'accès."
      />
    );
  }

  const ticket = detail.data as unknown as Record<string, unknown>;
  const replies = (detail.data.replies ?? []) as Array<Record<string, unknown>>;
  const users = detail.data.users ?? [];
  const status = String(ticket["status"] ?? "open");
  const targets = (ticketTransitions[status as keyof typeof ticketTransitions] ?? []) as string[];
  const publicThread = replies.filter((item) => !item["is_internal"]);
  const internalThread = replies.filter((item) => item["is_internal"]);

  const userName = (userId: unknown) => {
    const match = users.find((user) => user.id === userId);
    return match?.full_name ?? match?.email ?? "Équipe";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${String(ticket["number"] ?? "")} · ${String(ticket["subject"] ?? "Ticket")}`}
        description="Conversation client et notes internes strictement séparées."
        actions={
          <div className="flex flex-wrap gap-2">
            {targets.map((target) => (
              <Button
                key={target}
                size="sm"
                variant={target === "resolved" ? "default" : "outline"}
                disabled={changeStatus.isPending}
                onClick={() => changeStatus.mutate(target)}
              >
                <StatusBadge value={target} className="bg-transparent p-0" />
              </Button>
            ))}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Conversation client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <article className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Demande initiale · {formatDateTime(ticket["created_at"])}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{String(ticket["description"] ?? "")}</p>
            </article>
            {publicThread.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune réponse publique pour le moment.</p>
            ) : (
              publicThread.map((item) => (
                <article key={String(item["id"])} className="rounded-xl border border-border p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    {userName(item["author_id"])} · {formatDateTime(item["created_at"])}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{String(item["body"] ?? "")}</p>
                </article>
              ))
            )}

            {can("ticket_replies.create") && (
              <form
                className="space-y-3 border-t border-border pt-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (body.trim().length < 2) {
                    toast.error("Réponse trop courte");
                    return;
                  }
                  reply.mutate();
                }}
              >
                <Label htmlFor="reply">Répondre</Label>
                <Textarea
                  id="reply"
                  rows={5}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Message…"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="internal"
                      checked={internal}
                      onCheckedChange={(checked) => setInternal(checked === true)}
                    />
                    <Label htmlFor="internal" className="text-sm font-normal text-muted-foreground">
                      Note interne (invisible pour le client)
                    </Label>
                  </div>
                  <Button type="submit" disabled={reply.isPending} className="ml-auto">
                    {reply.isPending ? "Envoi…" : internal ? "Ajouter la note" : "Envoyer au client"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-border">
                <DetailRow label="Statut">
                  <StatusBadge value={ticket["status"]} />
                </DetailRow>
                <DetailRow label="Priorité">
                  <StatusBadge value={ticket["priority"]} />
                </DetailRow>
                <DetailRow label="Demandeur">{String(ticket["requester_email"] ?? "—")}</DetailRow>
                <DetailRow label="Assigné à">{userName(ticket["assignee_id"])}</DetailRow>
                <DetailRow label="1re réponse">{formatDateTime(ticket["first_response_at"])}</DetailRow>
                <DetailRow label="Résolu le">{formatDateTime(ticket["resolved_at"])}</DetailRow>
                <DetailRow label="Clôturé le">{formatDateTime(ticket["closed_at"])}</DetailRow>
              </dl>
            </CardContent>
          </Card>

          {can("tickets.assign") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assignation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={assignee} onValueChange={setAssignee}>
                  <SelectTrigger aria-label="Assigner à">
                    <SelectValue placeholder="Choisir un membre" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name ?? user.email ?? user.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  disabled={!assignee || assign.isPending}
                  onClick={() => assign.mutate()}
                >
                  Assigner
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes internes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {internalThread.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune note interne.</p>
              ) : (
                internalThread.map((item) => (
                  <div key={String(item["id"])} className="rounded-lg border border-dashed border-border p-3">
                    <p className="text-xs text-muted-foreground">
                      {userName(item["author_id"])} · {formatDateTime(item["created_at"])}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{String(item["body"] ?? "")}</p>
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
