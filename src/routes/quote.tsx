import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { Container, Eyebrow, Section } from "@/components/common/layout-primitives";
import { QuoteForm } from "@/components/forms/quote-form";
import { PROCESS_STEPS } from "@/content/site";
import { getPublishedServicesFn } from "@/lib/public-content.functions";

const TITLE = "Demander un devis — Zawena";
const DESCRIPTION =
  "Décrivez votre projet en trois étapes : besoin, cadre budgétaire et coordonnées. Nous revenons avec un périmètre et des étapes claires.";

const searchSchema = z.object({ service: z.string().trim().max(160).optional() });

export const Route = createFileRoute("/quote")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://zawena.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://zawena.lovable.app/og-image.jpg" },
      { property: "og:url", content: "https://zawena.lovable.app/quote" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://zawena.lovable.app/quote" }],
  }),
  loader: () => getPublishedServicesFn(),
  component: QuotePage,
});

function QuotePage() {
  const services = Route.useLoaderData();
  const { service } = Route.useSearch();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-[0.25] surface-grid" aria-hidden="true" />
        <Container className="relative">
          <Eyebrow>Devis</Eyebrow>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.08] sm:text-5xl">
            Demander un devis
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Trois étapes suffisent. Nous n'envoyons jamais de tarif automatique : chaque devis repose sur un périmètre
            compris et validé.
          </p>
        </Container>
      </section>

      <Section tone="default">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="rounded-3xl border border-border bg-card p-7 sm:p-9">
            <QuoteForm services={services} defaultServiceSlug={service ?? ""} />
          </div>
          <aside className="space-y-6">
            <h2 className="font-display text-lg font-semibold">Ce qui se passe ensuite</h2>
            <ol className="space-y-4">
              {PROCESS_STEPS.slice(0, 4).map((item) => (
                <li key={item.step} className="rounded-2xl border border-border bg-surface p-5">
                  <span className="font-mono text-xs font-semibold text-primary">{item.step}</span>
                  <h3 className="mt-2 font-display text-base font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </Section>
    </>
  );
}
