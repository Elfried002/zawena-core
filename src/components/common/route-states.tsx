import { Link, useRouter } from "@tanstack/react-router";

import { ErrorState } from "@/components/common/async-states";
import { Container, Section } from "@/components/common/layout-primitives";
import { Button } from "@/components/ui/button";

/**
 * États locaux pour les routes alimentées par le CMS.
 * Aucun détail technique (stack, SQL, erreur Supabase) n'est affiché : seuls
 * des messages compréhensibles par un visiteur non technique.
 */
export function CmsErrorComponent() {
  const router = useRouter();
  return (
    <Section>
      <Container>
        <ErrorState
          title="Impossible de charger ce contenu pour le moment"
          description="Le contenu n'a pas pu être récupéré. Veuillez réessayer dans quelques instants."
          onRetry={() => void router.invalidate()}
        >
          <Button asChild variant="ghost" className="mt-1">
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </ErrorState>
      </Container>
    </Section>
  );
}

export function CmsNotFoundComponent({
  title = "Cette page n'existe pas",
  description = "Le contenu demandé n'est plus disponible ou l'adresse est incorrecte.",
  backTo = "/",
  backLabel = "Retour à l'accueil",
}: {
  title?: string;
  description?: string;
  backTo?: "/" | "/services" | "/portfolio";
  backLabel?: string;
}) {
  return (
    <Section>
      <Container>
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl border border-dashed border-border px-8 py-16 text-center">
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
          <Button asChild className="mt-2 rounded-full">
            <Link to={backTo}>{backLabel}</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}