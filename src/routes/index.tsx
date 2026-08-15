import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";

import { Container, Eyebrow, Section, SectionHeading } from "@/components/common/layout-primitives";
import { Reveal } from "@/components/common/reveal";
import { EmptyState } from "@/components/common/async-states";
import { FeatureCard, PortfolioCard, ServiceCard } from "@/components/marketing/cards";
import { FaqAccordion, FinalCta, ProcessTimeline, TrustStrip } from "@/components/marketing/sections";
import {
  AgentConsole,
  DashboardMockup,
  IntegrationMap,
  SecurityFlow,
  SystemDiagram,
  WorkflowDiagram,
} from "@/components/visuals/tech-visuals";
import { Button } from "@/components/ui/button";
import { BRAND, DIFFERENTIATORS, PROBLEMS } from "@/content/site";
import { getHomeContentFn } from "@/lib/public-content.functions";
import type { PublicFaq, PublicProject, PublicService } from "@/services/public/public.types";

const TITLE = "Zawena — IA, automatisation et ingénierie logicielle pour les entreprises";
const DESCRIPTION =
  "Zawena transforme des problèmes métier en systèmes concrets : agents IA, automatisation de workflows, intégration, applications sur mesure et cybersécurité.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://zawena.com/og-image.jpg" },
      { name: "twitter:image", content: "https://zawena.com/og-image.jpg" },
      { property: "og:url", content: "https://zawena.com/" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://zawena.com/" }],
  }),
  loader: () => getHomeContentFn(),
  component: HomePage,
});

function HomePage() {
  const { services, projects, faqs }: { services: PublicService[]; projects: PublicProject[]; faqs: PublicFaq[] } =
    Route.useLoaderData();

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-[0.28] surface-grid" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -left-40 top-10 size-[420px] rounded-full bg-primary/12 blur-3xl"
          aria-hidden="true"
        />
        <Container className="relative">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div>
              <Eyebrow>{BRAND.tagline}</Eyebrow>
              <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.06] sm:text-5xl lg:text-[3.75rem]">
                Nous transformons vos processus métier en{" "}
                <span className="text-gradient-brand">systèmes intelligents</span> et sécurisés
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                Zawena conçoit des agents IA, automatise vos workflows, intègre l'IA à vos outils existants,
                développe vos applications métier et sécurise l'ensemble. Le tout au service d'un résultat mesurable.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="group h-12 rounded-full px-7 text-base">
                  <Link to="/quote">
                    Demander un devis
                    <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7 text-base">
                  <Link to="/services">Découvrir nos services</Link>
                </Button>
              </div>
              <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {["Périmètre cadré avant réalisation", "Règles métier côté serveur", "Sécurité dès la conception"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="size-4 text-primary" aria-hidden="true" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
            <SystemDiagram />
          </div>
        </Container>
      </section>

      <TrustStrip />

      <Section tone="default">
        <SectionHeading
          eyebrow="Le point de départ"
          title="Les blocages que nous rencontrons le plus souvent"
          description="Avant de parler de technologie, nous identifions ce qui coûte réellement du temps, de l'argent ou de la fiabilité."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROBLEMS.map((problem, index) => (
            <Reveal key={problem.title} delay={index * 50}>
              <FeatureCard title={problem.title} description={problem.description} index={index} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="surface" id="services">
        <SectionHeading
          eyebrow="Nos expertises"
          title="Sept expertises, une seule logique : résoudre un problème métier"
          description="Chaque expertise peut être mobilisée seule ou combinée aux autres selon la maturité de votre système."
        />
        {services.length === 0 ? (
          <div className="mt-14">
            <EmptyState
              title="Services en cours de publication"
              description="Le catalogue est momentanément indisponible. Vous pouvez nous écrire directement pour en discuter."
            />
          </div>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service.slug} delay={index * 50}>
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>
        )}
      </Section>

      <Section tone="default">
        <SectionHeading
          eyebrow="Capacités en situation"
          title="Voir le système, pas seulement la promesse"
          description="Ces schémas illustrent la forme concrète de nos livrables. Ce sont des visualisations, pas des résultats client."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <AgentConsole className="h-full" />
          </Reveal>
          <Reveal delay={60}>
            <WorkflowDiagram className="h-full" />
          </Reveal>
          <Reveal delay={120}>
            <IntegrationMap className="h-full" />
          </Reveal>
          <Reveal delay={180}>
            <SecurityFlow className="h-full" />
          </Reveal>
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Applications métier"
              title="Des interfaces que vos équipes utilisent vraiment"
              description="Nous concevons produit, interface et architecture ensemble : parcours clairs, données fiables, états de chargement et d'erreur traités."
            />
            <ul className="mt-8 space-y-3">
              {[
                "Rôles et permissions vérifiés côté serveur",
                "Indicateurs lisibles plutôt que tableaux de bord surchargés",
                "Accessibilité et responsive traités dès la conception",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-foreground/85">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" size="lg" className="mt-9 rounded-full">
              <Link to="/services/$slug" params={{ slug: "ai-applications" }}>
                Voir AI Applications
              </Link>
            </Button>
          </div>
          <Reveal>
            <DashboardMockup />
          </Reveal>
        </div>
      </Section>

      <Section tone="default">
        <SectionHeading
          eyebrow="Pourquoi Zawena"
          title="Une manière de travailler, pas un catalogue d'outils"
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DIFFERENTIATORS.map((item, index) => (
            <Reveal key={item.title} delay={index * 50}>
              <FeatureCard title={item.title} description={item.description} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="Notre processus"
          title="Sept étapes, du cadrage à l'amélioration continue"
          description="Chaque étape produit un livrable vérifiable. Vous savez à tout moment où en est le projet."
        />
        <ProcessTimeline />
      </Section>

      <Section tone="default">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Ce que nous construisons"
            title="Concepts, prototypes et projets internes"
            description="Nous ne publions aucun témoignage ni résultat client non vérifiable. Voici ce que nous avons réellement construit."
          />
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/portfolio">Toutes les réalisations</Link>
          </Button>
        </div>
        {projects.length === 0 ? (
          <div className="mt-14">
            <EmptyState
              title="Aucune réalisation publiée"
              description="Nos réalisations seront publiées ici dès leur validation."
            />
          </div>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Reveal key={project.slug} delay={index * 60}>
                <PortfolioCard project={project} />
              </Reveal>
            ))}
          </div>
        )}
      </Section>

      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <SectionHeading eyebrow="Questions fréquentes" title="Ce que les entreprises nous demandent le plus" />
          <div>
            <FaqAccordion items={faqs} />
            <Button asChild variant="ghost" className="mt-6 rounded-full">
              <Link to="/faq">
                Voir toutes les questions
                <ArrowRight className="ml-1 size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
