import { createFileRoute, Link } from "@tanstack/react-router";

import { EmptyState } from "@/components/common/async-states";
import { Container, Eyebrow, Section } from "@/components/common/layout-primitives";
import { Reveal } from "@/components/common/reveal";
import { PortfolioCard } from "@/components/marketing/cards";
import { FinalCta } from "@/components/marketing/sections";
import { Badge } from "@/components/ui/badge";
import { getPublishedProjectsFn } from "@/lib/public-content.functions";

const TITLE = "Réalisations — concepts, prototypes et projets internes | Zawena";
const DESCRIPTION =
  "Les systèmes que Zawena a réellement construits : agents IA, automatisations, applications métier et dispositifs de sécurité. Aucun résultat client inventé.";

export const Route = createFileRoute("/portfolio/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://zawena.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://zawena.lovable.app/og-image.jpg" },
      { property: "og:url", content: "https://zawena.lovable.app/portfolio" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://zawena.lovable.app/portfolio" }],
  }),
  loader: () => getPublishedProjectsFn({ data: {} }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const projects = Route.useLoaderData();
  const categories = Array.from(new Set(projects.map((project) => project.content.category)));

  return (
    <>
      <section className="relative overflow-hidden border-b border-border py-16 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0 opacity-[0.25] surface-grid" aria-hidden="true" />
        <Container className="relative">
          <Eyebrow>Réalisations</Eyebrow>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.08] sm:text-5xl">
            Ce que nous avons construit, présenté honnêtement
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Chaque réalisation est identifiée comme concept, prototype ou projet interne. Nous ne publions ni
            témoignage ni statistique que nous ne pouvons démontrer.
          </p>
          {categories.length > 0 ? (
            <ul className="mt-8 flex flex-wrap gap-2">
              {categories.map((category) => (
                <li key={category}>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 font-normal">
                    {category}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : null}
        </Container>
      </section>

      <Section tone="default">
        {projects.length === 0 ? (
          <EmptyState
            title="Aucune réalisation publiée"
            description="Nos travaux seront publiés ici dès leur validation. Écrivez-nous pour en discuter."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Reveal key={project.slug} delay={index * 50}>
                <PortfolioCard project={project} />
              </Reveal>
            ))}
          </div>
        )}
        <p className="mt-12 text-sm text-muted-foreground">
          Vous cherchez une expertise précise ?{" "}
          <Link to="/services" className="font-medium text-primary underline-offset-4 hover:underline">
            Parcourir nos services
          </Link>
          .
        </p>
      </Section>

      <FinalCta title="Un système comparable à construire pour votre entreprise ?" />
    </>
  );
}
