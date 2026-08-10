import { createFileRoute } from "@tanstack/react-router";

import { Container, Eyebrow, Section, SectionHeading } from "@/components/common/layout-primitives";
import { Reveal } from "@/components/common/reveal";
import { FeatureCard } from "@/components/marketing/cards";
import { FinalCta, ProcessTimeline } from "@/components/marketing/sections";
import { SystemDiagram } from "@/components/visuals/tech-visuals";
import { BRAND, DIFFERENTIATORS } from "@/content/site";

const TITLE = "À propos — la vision et la méthode de Zawena";
const DESCRIPTION =
  "Zawena est une entreprise technologique B2B : IA, automatisation, ingénierie logicielle et cybersécurité, avec une exigence d'architecture et d'honnêteté.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/about" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    title: "Clarté avant technologie",
    description: "Nous refusons de proposer une solution avant d'avoir compris le processus métier qu'elle sert.",
  },
  {
    title: "Honnêteté du discours",
    description: "Aucun chiffre, témoignage ou logo que nous ne pouvons démontrer. Nos travaux sont présentés tels qu'ils sont.",
  },
  {
    title: "Sécurité par défaut",
    description: "Rôles, permissions et règles critiques sont vérifiés côté serveur, pas seulement dans l'interface.",
  },
  {
    title: "Dette technique maîtrisée",
    description: "Chaque décision d'architecture est prise pour rester tenable dans plusieurs années, pas seulement livrable.",
  },
];

function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border py-16 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0 opacity-[0.25] surface-grid" aria-hidden="true" />
        <Container className="relative">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <Eyebrow>À propos</Eyebrow>
              <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] sm:text-5xl">
                Une entreprise technologique construite autour de l'architecture
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                {BRAND.promise} Nous intervenons là où l'IA, l'automatisation, le logiciel et la sécurité doivent
                fonctionner ensemble — pas comme des projets séparés.
              </p>
            </div>
            <Reveal>
              <SystemDiagram />
            </Reveal>
          </div>
        </Container>
      </section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="Notre conviction"
          title="La technologie n'a de valeur que si elle change un processus réel"
          description="Trop de projets échouent parce qu'ils partent de l'outil. Nous partons du problème, de la donnée et des personnes qui l'utilisent."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {VALUES.map((value, index) => (
            <Reveal key={value.title} delay={index * 50}>
              <FeatureCard title={value.title} description={value.description} index={index} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="default">
        <SectionHeading eyebrow="Pourquoi Zawena" title="Ce qui structure notre manière de travailler" />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DIFFERENTIATORS.map((item, index) => (
            <Reveal key={item.title} delay={index * 50}>
              <FeatureCard title={item.title} description={item.description} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="Méthode" title="Un processus lisible du début à la fin" />
        <ProcessTimeline />
      </Section>

      <FinalCta />
    </>
  );
}
