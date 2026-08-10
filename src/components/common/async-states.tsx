import { AlertTriangle, Inbox } from "lucide-react";
import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function CardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-3xl border border-border p-8">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="mt-6 h-5 w-2/3" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border px-8 py-16 text-center">
      <Inbox className="size-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-lg font-medium">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function ErrorState({
  title = "Contenu momentanément indisponible",
  description = "Une erreur est survenue. Veuillez réessayer dans quelques instants.",
  onRetry,
  children,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  children?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-surface px-8 py-16 text-center"
    >
      <AlertTriangle className="size-6 text-destructive" aria-hidden="true" />
      <p className="text-lg font-medium">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          Réessayer
        </Button>
      ) : null}
      {children}
    </div>
  );
}
