import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, ShieldCheck } from "lucide-react";

import { ContactForm } from "@/components/forms/contact-form";
import { Container, Eyebrow, Section } from "@/components/common/layout-primitives";
import { BRAND } from "@/content/site";

const TITLE = "Contact — parler à Zawena de votre projet technologique";
const DESCRIPTION =
  "Décrivez votre contexte : automatisation, agents IA, application métier ou sécurité. Nous répondons avec une lecture concrète de la faisabilité.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://zawena.com/og-image.jpg" },
      { name: "twitter:image", content: "https://zawena.com/og-image.jpg" },
      { property: "og:url", content: "https://zawena.com/contact" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://zawena.com/contact" }],
  }),
  component: ContactPage,
});

const ASSURANCES = [
  { icon: Clock, title: "Réponse sous 1 jour ouvré", description: "Un échange court suffit souvent à clarifier le périmètre." },
  { icon: ShieldCheck, title: "Confidentialité", description: "Vos informations servent uniquement à traiter votre demande." },
  { icon: Mail, title: "Un seul interlocuteur", description: "Vous parlez directement à l'équipe qui construit." },
];

function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-[0.25] surface-grid" aria-hidden="true" />
        <Container className="relative">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.08] sm:text-5xl">
            Parlons de votre projet
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Plus votre contexte est précis, plus notre réponse sera utile. Si vous souhaitez déjà une estimation
            structurée, utilisez plutôt la demande de devis.
          </p>
        </Container>
      </section>

      <Section tone="default">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="space-y-8">
            <div className="rounded-3xl border border-border bg-card p-7">
              <h2 className="font-display text-lg font-semibold">Écrire directement</h2>
              <a
                href={`mailto:${BRAND.email}`}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                <Mail className="size-4" aria-hidden="true" />
                {BRAND.email}
              </a>
            </div>
            <ul className="space-y-4">
              {ASSURANCES.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-4 rounded-3xl border border-border bg-card p-6">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-primary-soft text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card p-7 sm:p-9">
            <h2 className="font-display text-xl font-semibold">Formulaire de contact</h2>
            <p className="mt-2 text-sm text-muted-foreground">Les champs marqués d'un astérisque sont obligatoires.</p>
            <ContactForm className="mt-8" />
          </div>
        </div>
      </Section>
    </>
  );
}
