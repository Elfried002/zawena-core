import { createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "@/components/common/async-states";
import { Container, Eyebrow, Section, SectionHeading } from "@/components/common/layout-primitives";
import { Reveal } from "@/components/common/reveal";
import { ServiceCard } from "@/components/marketing/cards";
import { FinalCta, ProcessTimeline } from "@/components/marketing/sections";
import { getPublishedServicesFn } from "@/lib/public-content.functions";

const TITLE = "Services — IA, automatisation, ingénierie et sécurité | Zawena";
const DESCRIPTION =
  "Les sept expertises Zawena : AI Agents, AI Automation, AI Integration, AI Applications, Software Engineering, Cybersecurity et AI Consulting.";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://zawena.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://zawena.lovable.app/og-image.jpg" },
      { property: "og:url", content: "https://zawena.lovable.app/services" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://zawena.lovable.app/services" }],
  }),
  loader: () => getPublishedServicesFn(),
  component: ServicesPage,
});

function ServicesPage() {
  const services = Route.useLoaderData();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border py-16 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0 opacity-[0.25] surface-grid" aria-hidden="true" />
        <Container className="relative">
          <Eyebrow>Services</Eyebrow>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.08] sm:text-5xl">
            Sept expertises pour concevoir, automatiser, intégrer et sécuriser vos systèmes
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Chaque mission commence par le problème métier. La technologie n'arrive qu'ensuite, choisie pour sa
            pertinence et sa maintenabilité.
          </p>
        </Container>
      </section>

      <Section tone="default">
        {services.length === 0 ? (
          <EmptyState
            title="Catalogue momentanément indisponible"
            description="Écrivez-nous pour discuter directement de votre besoin."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service.slug} delay={index * 50}>
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>
        )}
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="Notre processus"
          title="La même méthode, quel que soit le service"
          description="Un cadrage court, une architecture explicite, des livraisons vérifiables."
        />
        <ProcessTimeline />
      </Section>

      <FinalCta />
    </>
  );
}
