/**
 * Devise d'affichage suggérée pour le visiteur.
 * La détection n'est jamais considérée comme certaine : le client peut la
 * remplacer manuellement, et aucun montant n'est accepté du navigateur.
 */
import { createServerFn } from "@tanstack/react-start";

import { FALLBACK_CURRENCY, currencyForCountry } from "@/services/public/currency";
import type { DisplayCurrency } from "@/services/public/currency";

export interface VisitorCurrency {
  currency: DisplayCurrency;
  country: string | null;
  /** `false` lorsque le fallback Zawena est utilisé. */
  detected: boolean;
}

export const getVisitorCurrencyFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<VisitorCurrency> => {
    const { countryFromRequest } = await import("@/services/public/geo.server");
    const country = countryFromRequest();
    if (!country) return { currency: FALLBACK_CURRENCY, country: null, detected: false };
    return { currency: currencyForCountry(country), country, detected: true };
  },
);
