import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Check, Package } from "lucide-react";

import { Container, Eyebrow, Section, SectionHeading } from "@/components/common/layout-primitives";
import { Reveal } from "@/components/common/reveal";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { FeatureCard } from "@/components/marketing/cards";
import { FaqAccordion, FinalCta, ProcessTimeline } from "@/components/marketing/sections";
import { PricingCards, StartingPrice } from "@/components/marketing/pricing";
import { AgentConsole, DashboardMockup, IntegrationMap, SecurityFlow, WorkflowDiagram } from "@/components/visuals/tech-visuals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { serviceIcon } from "@/content/site";
import { CmsErrorComponent, CmsNotFoundComponent } from "@/components/common/route-states";
import { getPublishedServiceFn } from "@/lib/public-content.functions";
import { isMissingContentError } from "@/lib/route-errors";
import type { PublicService } from "@/services/public/public.types";

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ params }) => {
    try {
      return await getPublishedServiceFn({ data: { slug: params.slug } });
    } catch (error) {
      if (isMissingContentError(error)) throw notFound();
      throw error;
    }
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Service introuvable — Zawena" }, { name: "robots", content: "noindex" }] };
    }
    const title = loaderData.seoTitle ?? `${loaderData.title} — Zawena`;
    const description = loaderData.seoDescription ?? loaderData.summary;
    const url = `https://zawena.com/services/${params.slug}`;
    const image = loaderData.content.image
      ? `https://zawena.com${loaderData.content.image}`
      : "https://zawena.com/og-image.jpg";
    const offers = loaderData.content.pricing;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:image", content: image },
        { property: "og:image:alt", content: loaderData.content.imageAlt || loaderData.title },
        { name: "twitter:image", content: image },
        { property: "og:url", content: url },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: loaderData.title,
            description,
            url,
            provider: { "@type": "Organization", name: "Zawena" },
            areaServed: ["CI", "Africa", "Worldwide"],
            ...(offers.length > 0
              ? {
                  offers: offers.map((offer) => ({
                    "@type": "Offer",
                    name: offer.name,
                    price: offer.priceXof,
                    priceCurrency: "XOF",
                    description: "Prix de mise en place, à partir de.",
                    url,
                  })),
                }
              : {}),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zawena.com/" },
              { "@type": "ListItem", position: 2, name: "Services", item: "https://zawena.com/services" },
              { "@type": "ListItem", position: 3, name: loaderData.title, item: url },
            ],
          }),
        },
        ...(loaderData.content.faq.length > 0
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: loaderData.content.faq.map((item) => ({
                    "@type": "Question",
                    name: item.question,
                    acceptedAnswer: { "@type": "Answer", text: item.answer },
                  })),
                }),
              },
            ]
          : []),
      ],
    };
  },
  component: ServiceDetailPage,
  errorComponent: CmsErrorComponent,
  notFoundComponent: () => (
    <CmsNotFoundComponent
      title="Ce service n'existe pas"
      description="Le service demandé n'est pas disponible. Découvrez l'ensemble de nos expertises."
      backTo="/services"
      backLabel="Voir tous les services"
    />
  ),
});

/** Visuel adapté au domaine du service. */
function ServiceVisual({ service }: { service: PublicService }) {
  switch (service.slug) {
    case "ai-agents":
      return <AgentConsole />;
    case "ai-automation":
      return <WorkflowDiagram />;
    case "ai-integration":
    case "software-engineering":
      return <IntegrationMap />;
    case "cybersecurity":
      return <SecurityFlow />;
    default:
      return <DashboardMockup />;
  }
}

function ServiceDetailPage() {
  const service: PublicService = Route.useLoaderData();
  const Icon = serviceIcon(service.icon);
  const { content } = service;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border py-14 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0 opacity-[0.25] surface-grid" aria-hidden="true" />
        <Container className="relative">
          <Breadcrumbs
            items={[
              { label: "Accueil", to: "/" },
              { label: "Services", to: "/services" },
              { label: service.title },
            ]}
          />
          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <Eyebrow>
                <Icon className="size-3.5" aria-hidden="true" />
                {content.eyebrow || service.title}
              </Eyebrow>
              <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] sm:text-5xl">{service.title}</h1>
              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                {service.summary}
              </p>
              {content.benefit ? (
                <p className="mt-6 max-w-xl border-l-2 border-primary pl-4 font-medium">{content.benefit}</p>
              ) : null}
              <StartingPrice offers={content.pricing} className="mt-6 text-base" />
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="group h-12 rounded-full px-7">
                  <Link to="/quote" search={{ service: service.slug }}>
                    Demander un devis
                    <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7">
                  <Link to="/contact">Parler à Zawena</Link>
                </Button>
              </div>
            </div>
            {content.image ? (
              <figure className="overflow-hidden rounded-3xl border border-border bg-surface">
                <img
                  src={content.image}
                  alt={content.imageAlt || `Illustration du service ${service.title} par Zawena`}
                  width={1440}
                  height={810}
                  fetchPriority="high"
                  decoding="async"
                  className="h-auto w-full object-cover"
                />
              </figure>
            ) : (
              <Reveal>
                <ServiceVisual service={service} />
              </Reveal>
            )}
          </div>
        </Container>
      </section>

      {content.problem.length > 0 ? (
        <Section tone="default">
          <SectionHeading eyebrow="Le problème" title="Ce que nous constatons avant d'intervenir" />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.problem.map((item, index) => (
              <Reveal as="li" key={item} delay={index * 50}>
                <div className="h-full rounded-3xl border border-border bg-card p-7">
                  <span className="font-mono text-xs font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/85">{item}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </Section>
      ) : null}

      {content.solution ? (
        <Section tone="surface">
          <SectionHeading eyebrow="Notre approche" title="Comment nous traitons le sujet" description={content.solution} />
          <div className="mt-12 grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
            <Reveal>
              <ServiceVisual service={service} />
            </Reveal>
            {content.benefits.length > 0 ? (
              <div>
                <h3 className="font-display text-lg font-semibold">Bénéfices recherchés</h3>
                <ul className="mt-5 space-y-3">
                  {content.benefits.map((item) => (
                    <li key={item} className="flex gap-3 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="leading-relaxed text-foreground/85">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-xs text-muted-foreground">
                  Les bénéfices dépendent de votre contexte : nous ne promettons aucun résultat chiffré sans mesure
                  préalable.
                </p>
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {content.capabilities.length > 0 ? (
        <Section tone="default">
          <SectionHeading eyebrow="Capacités" title="Ce que couvre concrètement cette expertise" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.capabilities.map((capability, index) => (
              <Reveal key={capability.title} delay={index * 50}>
                <FeatureCard title={capability.title} description={capability.description} />
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}

      {content.useCases.length > 0 || content.technologies.length > 0 ? (
        <Section tone="surface">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {content.useCases.length > 0 ? (
              <div>
                <SectionHeading
                  eyebrow="Cas d'usage"
                  title="Exemples de mise en œuvre"
                  description="Scénarios présentés à titre d'exemple, et non comme des réalisations déjà livrées."
                />
                <ul className="mt-8 space-y-4">
                  {content.useCases.map((useCase) => (
                    <li key={useCase} className="flex gap-3 rounded-2xl border border-border bg-card p-5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="leading-relaxed">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {content.technologies.length > 0 ? (
              <div>
                <SectionHeading eyebrow="Technologies" title="Ce que nous utilisons" />
                <ul className="mt-8 flex flex-wrap gap-2">
                  {content.technologies.map((tech) => (
                    <li key={tech}>
                      <Badge variant="secondary" className="rounded-full px-3.5 py-1.5 text-sm font-normal">
                        {tech}
                      </Badge>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-muted-foreground">
                  Le choix final dépend de votre système existant et de vos contraintes internes.
                </p>
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      <Section tone="default">
        <SectionHeading eyebrow="Processus" title="Du cadrage à l'amélioration continue" />
        <ProcessTimeline steps={content.process} />
      </Section>

      {content.deliverables.length > 0 ? (
        <Section tone="surface">
          <SectionHeading eyebrow="Livrables" title="Ce que vous recevez concrètement" />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.deliverables.map((item, index) => (
              <Reveal as="li" key={item} delay={index * 50}>
                <div className="flex h-full gap-3 rounded-3xl border border-border bg-card p-6">
                  <Package className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-sm leading-relaxed text-foreground/85">{item}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </Section>
      ) : null}

      {content.pricing.length > 0 ? (
        <Section tone="default">
          <SectionHeading
            eyebrow="Prix"
            title="Tarifs de mise en place"
            description="Les montants ci-dessous correspondent à la mise en place, exprimés en francs CFA."
          />
          <PricingCards offers={content.pricing} note={content.pricingNote} serviceSlug={service.slug} />
        </Section>
      ) : null}

      {content.faq.length > 0 ? (
        <Section tone="surface">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <SectionHeading eyebrow="FAQ" title={`Questions sur ${service.title}`} />
            <FaqAccordion
              items={content.faq.map((item, index) => ({
                id: `${service.slug}-faq-${index}`,
                question: item.question,
                answer: item.answer,
                category: service.slug,
              }))}
            />
          </div>
        </Section>
      ) : null}

      <FinalCta title={`Un projet ${service.title} en tête ?`} />
    </>
  );
}