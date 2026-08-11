/**
 * Barre de workflow éditorial. Les transitions autorisées viennent de la
 * machine à états serveur : l'UI n'affiche que les cibles possibles.
 */
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useCan } from "./admin-context";
import { StatusBadge } from "./ui-bits";
import { Button } from "@/components/ui/button";
import { archiveContentFn, changeContentStatusFn } from "@/lib/admin-actions.functions";
import { contentTransitions } from "@/services/core/state-machines";
import type { CmsEntity } from "@/services/cms/cms.schemas";

const LABEL: Record<string, string> = {
  draft: "Repasser en brouillon",
  review: "Envoyer en relecture",
  published: "Publier",
  scheduled: "Programmer",
  archived: "Archiver",
};

export function ContentStatusBar({
  entity,
  id,
  status,
  onDone,
}: {
  entity: CmsEntity;
  id: string;
  status: string;
  onDone: () => void;
}) {
  const can = useCan();
  const targets = (contentTransitions[status as keyof typeof contentTransitions] ?? []) as string[];

  const change = useMutation({
    mutationFn: (next: string) => {
      if (next === "scheduled") {
        const publishAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
        return changeContentStatusFn({ data: { entity, id, status: next, publishAt } });
      }
      return changeContentStatusFn({ data: { entity, id, status: next } });
    },
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error("Transition refusée", { description: result.error.message });
        return;
      }
      toast.success("Statut mis à jour");
      onDone();
    },
  });

  const archive = useMutation({
    mutationFn: () => archiveContentFn({ data: { entity, id } }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error("Archivage refusé", { description: result.error.message });
        return;
      }
      toast.success("Contenu archivé");
      onDone();
    },
  });

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
      <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Statut</span>
      <StatusBadge value={status} />
      <div className="ml-auto flex flex-wrap gap-2">
        {targets
          .filter((target) => target !== "archived")
          .map((target) => (
            <Button
              key={target}
              size="sm"
              variant={target === "published" ? "default" : "outline"}
              disabled={change.isPending}
              onClick={() => change.mutate(target)}
            >
              {LABEL[target] ?? target}
            </Button>
          ))}
        {can(`${entity}.delete`) && status !== "archived" && (
          <Button size="sm" variant="ghost" disabled={archive.isPending} onClick={() => archive.mutate()}>
            Archiver
          </Button>
        )}
      </div>
    </div>
  );
}
