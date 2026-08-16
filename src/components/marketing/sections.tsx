import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";

import { Reveal } from "@/components/common/reveal";
import { Container, Eyebrow, Section, SectionHeading } from "@/components/common/layout-primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CAPABILITY_DOMAINS, PROCESS_STEPS } from "@/content/site";
import type { PublicFaq } from "@/services/public/public.types";

export function TrustStrip() {
  return (
    <div className="border-y border-border bg-surface py-10">
      <Container>
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Domaines d'expertise et capacités
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {CAPABILITY_DOMAINS.map((domain) => (
            <li key={domain} className="flex items-center gap-2 text-sm font-medium text-foreground/80">
              <Check className="size-4 text-primary" aria-hidden="true" />
              {domain}
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}

export function ProcessTimeline({
  steps,
}: {
  steps?: readonly { title: string; description: string }[];
}) {
  const items = (steps && steps.length > 0 ? steps : PROCESS_STEPS).map((item, index) => ({
    step: String(index + 1).padStart(2, "0"),
    title: item.title,
    description: item.description,
  }));
  return (
    <div className="mt-14">
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <Reveal as="li" key={item.step} delay={index * 60}>
            <div className="relative h-full rounded-2xl border border-border bg-card p-6">
              <span className="font-mono text-xs font-semibold text-primary">{item.step}</span>
              <h3 className="mt-3 font-display text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              <span
                aria-hidden="true"
                className="absolute -right-2 top-1/2 hidden h-px w-4 bg-border lg:block"
              />
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

export function FaqAccordion({ items }: { items: PublicFaq[] }) {
  if (items.length === 0) return null;
  return (
    <Accordion type="single" collapsible className="mt-10 divide-y divide-border border-y border-border">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} className="border-none">
          <AccordionTrigger className="py-5 text-left font-display text-base font-medium hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pb-6 text-sm leading-relaxed text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function FinalCta({
  title = "Prêt à transformer une idée ou un processus en solution technologique ?",
  description = "Décrivez votre contexte : nous revenons vers vous avec une lecture concrète de la faisabilité, des étapes et du périmètre.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Section tone="deep">
      <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-gradient-to-br from-primary/20 via-transparent to-violet/20 px-6 py-16 sm:px-12 lg:px-16 lg:py-20">
        <div
          className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/25 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <Eyebrow className="border-white/15 bg-white/10 text-deep-foreground">Parlons de votre projet</Eyebrow>
          <h2 className="mt-6 text-balance text-3xl font-semibold leading-[1.12] sm:text-4xl lg:text-5xl">{title}</h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-deep-foreground/75 sm:text-lg">
            {description}
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="group rounded-full">
              <Link to="/contact">
                Parler à Zawena
                <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/25 bg-transparent text-deep-foreground hover:bg-white/10 hover:text-deep-foreground"
            >
              <Link to="/quote">Demander un devis</Link>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}

export { SectionHeading };
