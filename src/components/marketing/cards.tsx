import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { StartingPrice } from "@/components/marketing/pricing";
import { serviceIcon } from "@/content/site";
import { cn } from "@/lib/utils";
import type { PublicProject, PublicService } from "@/services/public/public.types";

export function ServiceCard({ service }: { service: PublicService }) {
  const Icon = serviceIcon(service.icon);
  return (
    <Link
      to="/services/$slug"
      params={{ slug: service.slug }}
      className="group card-hover flex h-full flex-col rounded-3xl border border-border bg-card p-7 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-8"
    >
      <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-primary-soft text-primary transition-transform duration-200 group-hover:-translate-y-0.5">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-6 font-display text-xl font-semibold">{service.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{service.summary}</p>
      {service.content.benefit ? (
        <p className="mt-4 border-l-2 border-primary/40 pl-3 text-sm font-medium text-foreground">
          {service.content.benefit}
        </p>
      ) : null}
      {service.content.technologies.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {service.content.technologies.slice(0, 4).map((tech) => (
            <li key={tech}>
              <Badge variant="secondary" className="rounded-full font-normal">
                {tech}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
      <StartingPrice offers={service.content.pricing} className="mt-6" />
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        Découvrir
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  );
}

export function PortfolioCard({ project }: { project: PublicProject }) {
  return (
    <Link
      to="/portfolio/$slug"
      params={{ slug: project.slug }}
      className="group card-hover flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface">
        <div className="absolute inset-0 opacity-40 surface-grid" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-violet/20 transition-transform duration-500 group-hover:scale-105"
          aria-hidden="true"
        />
        <div className="absolute left-5 top-5 flex gap-2">
          <Badge className="rounded-full">{project.content.category}</Badge>
          <Badge variant="outline" className="rounded-full bg-background/80">
            {project.content.kind}
          </Badge>
        </div>
        <span className="absolute bottom-5 right-5 flex size-9 items-center justify-center rounded-full border border-border bg-background/90 text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-7">
        <h3 className="font-display text-lg font-semibold">{project.title}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{project.summary}</p>
        {project.content.technologies.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {project.content.technologies.slice(0, 4).map((tech) => (
              <li key={tech}>
                <Badge variant="secondary" className="rounded-full font-normal">
                  {tech}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Link>
  );
}

export function FeatureCard({
  title,
  description,
  index,
  icon,
  className,
}: {
  title: string;
  description: string;
  index?: number;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card-hover h-full rounded-3xl border border-border bg-card p-7", className)}>
      {icon ? (
        <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-primary-soft text-primary">
          {icon}
        </span>
      ) : index !== undefined ? (
        <span className="font-mono text-xs font-semibold text-primary">
          {String(index + 1).padStart(2, "0")}
        </span>
      ) : null}
      <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
