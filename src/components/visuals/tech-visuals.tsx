/**
 * Visualisations marketing : représentations schématiques de systèmes.
 * Aucune donnée réelle ni résultat client n'y est présenté.
 */
import {
  Activity,
  Bell,
  Bot,
  Database,
  FileText,
  Lock,
  Radar,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

function Node({
  label,
  icon,
  emphasis = false,
  className,
}: {
  label: string;
  icon?: ReactNode;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium",
        emphasis
          ? "border-primary/30 bg-primary-soft text-accent-foreground shadow-soft"
          : "border-border bg-elevated text-foreground",
        className,
      )}
    >
      {icon}
      <span className="truncate font-mono uppercase tracking-wider">{label}</span>
    </div>
  );
}

function Connector({ orientation = "vertical" }: { orientation?: "vertical" | "horizontal" }) {
  return orientation === "vertical" ? (
    <div aria-hidden="true" className="mx-auto h-5 w-px bg-gradient-to-b from-primary/60 to-border" />
  ) : (
    <div aria-hidden="true" className="my-auto h-px w-full bg-gradient-to-r from-primary/60 to-border" />
  );
}

/** Composition centrale du Hero : un agent orchestrant des systèmes métier. */
export function SystemDiagram({ className }: { className?: string }) {
  return (
    <figure
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border bg-elevated p-6 shadow-lifted sm:p-8",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] surface-grid" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/20 blur-3xl"
        aria-hidden="true"
      />

      <figcaption className="relative flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Architecture type
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
          Schéma illustratif
        </span>
      </figcaption>

      <div className="relative mt-6 space-y-1">
        <Node label="AI Agent" emphasis icon={<Bot className="size-3.5" aria-hidden="true" />} className="mx-auto w-40" />
        <Connector />
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Node label="CRM" icon={<Database className="size-3.5" aria-hidden="true" />} />
          <Node label="ERP" icon={<FileText className="size-3.5" aria-hidden="true" />} />
          <Node label="API" icon={<Zap className="size-3.5" aria-hidden="true" />} />
        </div>
        <Connector />
        <Node label="Automation" emphasis icon={<Sparkles className="size-3.5" aria-hidden="true" />} className="mx-auto w-44" />
        <Connector />
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Business</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {[
              { label: "Délai de traitement", bars: [40, 62, 78] },
              { label: "Tâches automatisées", bars: [30, 55, 90] },
              { label: "Suivi des demandes", bars: [50, 70, 85] },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex h-16 items-end gap-1" aria-hidden="true">
                  {item.bars.map((value, index) => (
                    <span
                      key={index}
                      style={{ height: `${value}%` }}
                      className="w-full rounded-t bg-gradient-to-t from-primary/25 to-primary"
                    />
                  ))}
                </div>
                <p className="mt-2 truncate text-[11px] text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}

export function AgentConsole({ className }: { className?: string }) {
  const steps = [
    { label: "Tâche reçue", detail: "Demande entrante à qualifier" },
    { label: "Contexte récupéré", detail: "Historique + documentation interne" },
    { label: "Action proposée", detail: "Créer le prospect, préparer la réponse" },
    { label: "Validation humaine", detail: "Requise avant exécution" },
  ];
  return (
    <div className={cn("rounded-3xl border border-border bg-elevated p-6 shadow-soft", className)}>
      <div className="flex items-center gap-2">
        <Bot className="size-4 text-primary" aria-hidden="true" />
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Agent — exemple</p>
      </div>
      <ol className="mt-5 space-y-3">
        {steps.map((step, index) => (
          <li key={step.label} className="flex gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] font-semibold text-primary">
              {index + 1}
            </span>
            <span>
              <span className="block text-sm font-medium">{step.label}</span>
              <span className="block text-xs text-muted-foreground">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function WorkflowDiagram({ className }: { className?: string }) {
  const steps = ["Trigger", "AI Agent", "CRM", "Notification", "Report"];
  return (
    <div className={cn("rounded-3xl border border-border bg-elevated p-6 shadow-soft", className)}>
      <div className="flex items-center gap-2">
        <Activity className="size-4 text-primary" aria-hidden="true" />
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Workflow — exemple</p>
      </div>
      <ol className="mt-5 space-y-1">
        {steps.map((step, index) => (
          <li key={step}>
            <Node label={step} emphasis={index === 1} />
            {index < steps.length - 1 ? <Connector /> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function IntegrationMap({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-3xl border border-border bg-elevated p-6 shadow-soft", className)}>
      <div className="flex items-center gap-2">
        <Zap className="size-4 text-primary" aria-hidden="true" />
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Intégration — exemple
        </p>
      </div>
      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Node label="CRM" />
        <Connector orientation="horizontal" />
        <Node label="API" emphasis />
      </div>
      <div className="mx-auto my-1 h-5 w-px bg-gradient-to-b from-primary/60 to-border" aria-hidden="true" />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Node label="AI" emphasis />
        <Connector orientation="horizontal" />
        <Node label="ERP" />
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        Contrats d'interface explicites, accès aux données limités au nécessaire.
      </p>
    </div>
  );
}

export function SecurityFlow({ className }: { className?: string }) {
  const steps = [
    { label: "Network", icon: <Radar className="size-3.5" aria-hidden="true" /> },
    { label: "Detection", icon: <ShieldAlert className="size-3.5" aria-hidden="true" /> },
    { label: "Alert", icon: <Bell className="size-3.5" aria-hidden="true" /> },
    { label: "Analysis", icon: <Activity className="size-3.5" aria-hidden="true" /> },
    { label: "Response", icon: <Lock className="size-3.5" aria-hidden="true" /> },
  ];
  return (
    <div className={cn("rounded-3xl border border-border bg-elevated p-6 shadow-soft", className)}>
      <div className="flex items-center gap-2">
        <ShieldAlert className="size-4 text-primary" aria-hidden="true" />
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Chaîne de réponse — exemple
        </p>
      </div>
      <ol className="mt-5 space-y-1">
        {steps.map((step, index) => (
          <li key={step.label}>
            <Node label={step.label} icon={step.icon} emphasis={index === steps.length - 1} />
            {index < steps.length - 1 ? <Connector /> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function DashboardMockup({ className }: { className?: string }) {
  const rows = [
    { label: "Demandes entrantes", value: 72 },
    { label: "Traitées automatiquement", value: 58 },
    { label: "En attente de validation", value: 24 },
    { label: "Escaladées à un humain", value: 12 },
  ];
  return (
    <div className={cn("overflow-hidden rounded-3xl border border-border bg-elevated shadow-lifted", className)}>
      <div className="flex items-center gap-2 border-b border-border bg-surface px-5 py-3">
        <span className="size-2.5 rounded-full bg-destructive/60" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-chart-4/70" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-success/70" aria-hidden="true" />
        <p className="ml-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Dashboard — maquette
        </p>
      </div>
      <div className="space-y-4 p-6">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{row.label}</span>
              <span className="font-mono text-muted-foreground">{row.value}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-violet"
                style={{ width: `${row.value}%` }}
              />
            </div>
          </div>
        ))}
        <p className="pt-2 text-[11px] text-muted-foreground">
          Maquette d'illustration — ne représente pas des résultats client.
        </p>
      </div>
    </div>
  );
}
