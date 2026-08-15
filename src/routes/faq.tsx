import { createFileRoute, Link } from "@tanstack/react-router";

import { EmptyState } from "@/components/common/async-states";
import { Container, Eyebrow, Section, SectionHeading } from "@/components/common/layout-primitives";
import { FaqAccordion, FinalCta } from "@/components/marketing/sections";
import { getPublishedFaqFn } from "@/lib/public-content.functions";
import type { PublicFaq } from "@/services/public/public.types";
import { CmsErrorComponent, CmsNotFoundComponent } from "@/components/common/route-states";

const TITLE = "FAQ — questions fréquentes sur les projets Zawena";
const DESCRIPTION =
  "Délais, budgets, propriété du code, sécurité, maintenance : les réponses aux questions les plus fréquentes sur nos projets IA et logiciels.";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://zawena.com/og-image.jpg" },
      { name: "twitter:image", content: "https://zawena.com/og-image.jpg" },
      { property: "og:url", content: "https://zawena.com/faq" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://zawena.com/faq" }],
  }),
  loader: () => getPublishedFaqFn({ data: {} }),
  component: FaqPage,
  errorComponent: CmsErrorComponent,
  notFoundComponent: () => <CmsNotFoundComponent />,
});

function FaqPage() {
  const faqs: PublicFaq[] = Route.useLoaderData();
  const grouped = faqs.reduce<Record<string, typeof faqs>>((acc, item) => {
    const key = item.category || "Général";
    acc[key] = [...(acc[key] ?? []), item];
    return acc;
  }, {});
  const categories = Object.keys(grouped);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-[0.25] surface-grid" aria-hidden="true" />
        <Container className="relative">
          <Eyebrow>FAQ</Eyebrow>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.08] sm:text-5xl">
            Questions fréquentes
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Vous ne trouvez pas votre réponse ?{" "}
            <Link to="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
              Écrivez-nous
            </Link>
            , nous répondons précisément.
          </p>
        </Container>
      </section>

      <Section tone="default">
        {categories.length === 0 ? (
          <EmptyState
            title="Aucune question publiée"
            description="Notre FAQ sera enrichie prochainement. Contactez-nous en attendant."
          />
        ) : (
          <div className="space-y-16">
            {categories.map((category) => (
              <div key={category}>
                <SectionHeading title={category} />
                <FaqAccordion items={grouped[category] ?? []} />
              </div>
            ))}
          </div>
        )}
      </Section>

      <FinalCta title="Une question qui mérite un vrai échange ?" />
    </>
  );
}
