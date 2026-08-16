import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/common/reveal";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/services/public/currency";
import type { PricingOffer } from "@/services/public/public.types";

/**
 * Tarifs publics de **mise en place** uniquement (référence XOF).
 * Aucun tarif d'abonnement ni de récurrence n'est affiché sur le site public.
 */
export function PricingCards({
  offers,
  note,
  serviceSlug,
}: {
  offers: PricingOffer[];
  note?: string;
  serviceSlug: string;
}) {
  if (offers.length === 0) return null;
  return (
    <>
      <div
        className={cn(
          "mt-12 grid gap-6",
          offers.length >= 3 ? "sm:grid-cols-2 lg:grid-cols-3" : offers.length === 2 ? "sm:grid-cols-2" : "max-w-xl",
        )}
      >
        {offers.map((offer, index) => (
          <Reveal key={offer.name} delay={index * 60}>
            <div
              className={cn(
                "flex h-full flex-col rounded-3xl border bg-card p-7",
                offer.highlighted ? "border-primary/50 shadow-[0_1px_0_0_var(--color-primary)_inset]" : "border-border",
              )}
            >
              <h3 className="font-display text-lg font-semibold">{offer.name}</h3>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {offer.unit || "à partir de"}
              </p>
              <p className="mt-1.5 font-display text-3xl font-semibold tracking-tight">
                {formatAmount(offer.priceXof, "XOF")}
              </p>
              {offer.description ? (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{offer.description}</p>
              ) : null}
              {offer.features.length > 0 ? (
                <ul className="mt-5 space-y-2.5 text-sm">
                  {offer.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="leading-relaxed text-foreground/85">{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Button asChild variant={offer.highlighted ? "default" : "outline"} className="mt-7 rounded-full">
                <Link to="/quote" search={{ service: serviceSlug }}>
                  Demander un devis
                  <ArrowRight className="ml-1 size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
        {note || "Le tarif final dépend du périmètre, de la complexité et des besoins spécifiques du projet."}
      </p>
    </>
  );
}

/** Prix d'entrée affiché sur les cartes de service. */
export function StartingPrice({ offers, className }: { offers: PricingOffer[]; className?: string }) {
  const first = offers[0];
  if (!first) return null;
  const lowest = offers.reduce((min, offer) => (offer.priceXof < min.priceXof ? offer : min), first);
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      À partir de <span className="font-semibold text-foreground">{formatAmount(lowest.priceXof, "XOF")}</span>
    </p>
  );
}