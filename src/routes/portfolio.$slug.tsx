import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { Container, Eyebrow, Section } from "@/components/common/layout-primitives";
import { Reveal } from "@/components/common/reveal";
import { FinalCta } from "@/components/marketing/sections";
import { DashboardMockup } from "@/components/visuals/tech-visuals";
import { Badge } from "@/components/ui/badge";
import { getPublishedProjectFn } from "@/lib/public-content.functions";
import type { PublicProject } from "@/services/public/public.types";

export const Route = createFileRoute("/portfolio/$slug")({
  loader: async ({ params }) => {
    try {
      return await getPublishedProjectFn({ data: { slug: params.slug } });
    } catch {
      throw notFound();
    }
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Réalisation introuvable — Zawena" }, { name: "robots", content: "noindex" }] };
    }
    const title = loaderData.seoTitle ?? `${loaderData.title} — Réalisation Zawena`;
    const description = loaderData.seoDescription ?? loaderData.summary;
    const url = `https://zawena.lovable.app/portfolio/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:image", content: "https://zawena.lovable.app/og-image.jpg" },
        { name: "twitter:image", content: "https://zawena.lovable.app/og-image.jpg" },
        { property: "og:url", content: url },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const project: PublicProject = Route.useLoaderData();
  const { content } = project;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border py-14 sm:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-[0.25] surface-grid" aria-hidden="true" />
        <Container className="relative">
          <Link to="/portfolio" className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
            ← Toutes les réalisations
          </Link>
          <div className="mt-8 flex flex-wrap gap-2">
            <Badge className="rounded-full">{content.category}</Badge>
            <Badge variant="outline" className="rounded-full">
              {content.kind}
            </Badge>
            {project.industry ? (
              <Badge variant="secondary" className="rounded-full font-normal">
                {project.industry}
              </Badge>
            ) : null}
          </div>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.08] sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {project.summary}
          </p>
          <p className="mt-6 max-w-2xl rounded-2xl border border-border bg-surface p-4 text-sm text-muted-foreground">
            Transparence : ce travail est un <strong className="font-medium text-foreground">{content.kind}</strong>{" "}
            réalisé par Zawena. Aucun résultat client n'est présenté ici.
          </p>
        </Container>
      </section>

      <Section tone="default">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="space-y-12">
            {content.challenge ? (
              <div>
                <Eyebrow>Le défi</Eyebrow>
                <p className="mt-5 text-base leading-relaxed text-foreground/85">{content.challenge}</p>
              </div>
            ) : null}
            {content.approach.length > 0 ? (
              <div>
                <Eyebrow>Notre approche</Eyebrow>
                <ol className="mt-5 space-y-4">
                  {content.approach.map((step, index) => (
                    <li key={step} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                      <span className="font-mono text-xs font-semibold text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-sm leading-relaxed text-foreground/85">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
            {content.outcome ? (
              <div>
                <Eyebrow>Résultat</Eyebrow>
                <p className="mt-5 text-base leading-relaxed text-foreground/85">{content.outcome}</p>
              </div>
            ) : null}
          </div>

          <div className="space-y-8">
            <Reveal>
              <DashboardMockup />
            </Reveal>
            {content.technologies.length > 0 ? (
              <div className="rounded-3xl border border-border bg-card p-7">
                <h2 className="font-display text-base font-semibold">Technologies</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {content.technologies.map((tech) => (
                    <li key={tech}>
                      <Badge variant="secondary" className="rounded-full font-normal">
                        {tech}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="rounded-3xl border border-border bg-card p-7">
              <h2 className="font-display text-base font-semibold">Ce que cela démontre</h2>
              <ul className="mt-4 space-y-3 text-sm text-foreground/85">
                {["Architecture pensée avant le code", "Règles métier protégées côté serveur", "Interface au service de l'usage"].map(
                  (item) => (
                    <li key={item} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}