import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* ------------------------------- Formatteurs ------------------------------ */

export function formatMoney(amount: unknown, currency: unknown = "XOF"): string {
  const value = typeof amount === "number" ? amount : Number(amount ?? 0);
  const code = typeof currency === "string" && currency.length === 3 ? currency : "XOF";
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: code,
      maximumFractionDigits: code === "XOF" ? 0 : 2,
    }).format(value);
  } catch {
    return `${value} ${code}`;
  }
}

export function formatDate(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
}

export function formatDateTime(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function formatBytes(value: unknown): string {
  const bytes = typeof value === "number" ? value : Number(value ?? 0);
  if (!bytes) return "—";
  const units = ["o", "Ko", "Mo", "Go"];
  let index = 0;
  let size = bytes;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

/* --------------------------------- Statuts -------------------------------- */

const STATUS_TONE: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  contacted: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  reviewing: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  qualified: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  converted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  unqualified: "bg-muted text-muted-foreground",
  draft: "bg-muted text-muted-foreground",
  review: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  scheduled: "bg-primary/10 text-primary",
  published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  archived: "bg-muted text-muted-foreground",
  sent: "bg-primary/10 text-primary",
  viewed: "bg-primary/10 text-primary",
  accepted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  partially_paid: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  issued: "bg-primary/10 text-primary",
  overdue: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/10 text-destructive",
  declined: "bg-destructive/10 text-destructive",
  expired: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
  void: "bg-muted text-muted-foreground",
  open: "bg-primary/10 text-primary",
  assigned: "bg-primary/10 text-primary",
  in_progress: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  waiting_customer: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  resolved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  closed: "bg-muted text-muted-foreground",
  todo: "bg-muted text-muted-foreground",
  done: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  urgent: "bg-destructive/10 text-destructive",
  high: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  medium: "bg-muted text-muted-foreground",
  low: "bg-muted text-muted-foreground",
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  suspended: "bg-destructive/10 text-destructive",
  deactivated: "bg-muted text-muted-foreground",
  invited: "bg-primary/10 text-primary",
};

const STATUS_LABEL: Record<string, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  qualified: "Qualifié",
  unqualified: "Non qualifié",
  converted: "Converti",
  reviewing: "En analyse",
  quoted: "Devis envoyé",
  quote_created: "Devis créé",
  declined: "Refusé",
  draft: "Brouillon",
  review: "Relecture",
  scheduled: "Programmé",
  published: "Publié",
  archived: "Archivé",
  sent: "Envoyé",
  viewed: "Consulté",
  accepted: "Accepté",
  rejected: "Rejeté",
  expired: "Expiré",
  cancelled: "Annulé",
  issued: "Émise",
  partially_paid: "Partiellement payée",
  paid: "Payée",
  overdue: "En retard",
  void: "Annulée",
  open: "Ouvert",
  assigned: "Assigné",
  in_progress: "En cours",
  pending: "En attente",
  waiting_customer: "Attente client",
  resolved: "Résolu",
  closed: "Clôturé",
  todo: "À faire",
  done: "Terminé",
  urgent: "Urgent",
  high: "Haute",
  medium: "Moyenne",
  low: "Basse",
  active: "Actif",
  suspended: "Suspendu",
  deactivated: "Désactivé",
  invited: "Invité",
};

export function statusLabel(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  return STATUS_LABEL[value] ?? value.replace(/_/g, " ");
}

export function StatusBadge({ value, className }: { value: unknown; className?: string }) {
  if (typeof value !== "string" || !value) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge
      variant="secondary"
      className={cn("border-0 font-medium", STATUS_TONE[value] ?? "bg-muted text-muted-foreground", className)}
    >
      {statusLabel(value)}
    </Badge>
  );
}

/* --------------------------------- Blocs UI ------------------------------- */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  to,
}: {
  label: string;
  value: number | string;
  hint?: string;
  to?: string;
}) {
  const body = (
    <Card className="h-full transition-colors hover:border-primary/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl font-semibold tabular-nums">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
  return to ? (
    <Link to={to} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      <p className="font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-11 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}
