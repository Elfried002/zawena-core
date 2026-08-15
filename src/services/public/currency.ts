/**
 * Internationalisation des montants indicatifs (client-safe).
 *
 * Règles Zawena :
 * - La **devise de référence interne** est le XOF (marché principal : Côte d'Ivoire).
 * - L'affichage dans la devise du visiteur est une **estimation indicative** :
 *   aucun montant converti ne constitue un engagement contractuel.
 * - Les taux ci-dessous sont des **taux de référence internes**, révisés
 *   manuellement (voir RATES_UPDATED_AT). Ce ne sont pas des taux temps réel.
 * - Aucun montant envoyé par le navigateur n'est utilisé côté serveur : seule
 *   la clé de tranche (`budgetTier`) est transmise puis retraduite en libellé
 *   canonique XOF.
 */

export const REFERENCE_CURRENCY = "XOF" as const;

export const DISPLAY_CURRENCIES = [
  "XOF",
  "XAF",
  "EUR",
  "USD",
  "GBP",
  "CHF",
  "CAD",
  "MAD",
  "GNF",
] as const;
export type DisplayCurrency = (typeof DISPLAY_CURRENCIES)[number];

export interface CurrencyMeta {
  code: DisplayCurrency;
  /** Libellé montré à l'utilisateur (convention locale : FCFA pour XOF/XAF). */
  label: string;
  locale: string;
  /** Pas d'arrondi appliqué aux montants indicatifs. */
  step: number;
}

export const CURRENCY_META: Record<DisplayCurrency, CurrencyMeta> = {
  XOF: { code: "XOF", label: "FCFA (XOF)", locale: "fr-CI", step: 100_000 },
  XAF: { code: "XAF", label: "FCFA (XAF)", locale: "fr-CM", step: 100_000 },
  EUR: { code: "EUR", label: "Euro (EUR)", locale: "fr-FR", step: 500 },
  USD: { code: "USD", label: "Dollar US (USD)", locale: "en-US", step: 500 },
  GBP: { code: "GBP", label: "Livre sterling (GBP)", locale: "en-GB", step: 500 },
  CHF: { code: "CHF", label: "Franc suisse (CHF)", locale: "fr-CH", step: 500 },
  CAD: { code: "CAD", label: "Dollar canadien (CAD)", locale: "fr-CA", step: 500 },
  MAD: { code: "MAD", label: "Dirham marocain (MAD)", locale: "fr-MA", step: 5_000 },
  GNF: { code: "GNF", label: "Franc guinéen (GNF)", locale: "fr-GN", step: 5_000_000 },
};

/** Pays (ISO 3166-1 alpha-2) → devise d'affichage. Liste volontairement extensible. */
export const COUNTRY_CURRENCY: Record<string, DisplayCurrency> = {
  CI: "XOF",
  SN: "XOF",
  BJ: "XOF",
  TG: "XOF",
  BF: "XOF",
  ML: "XOF",
  NE: "XOF",
  GW: "XOF",
  CM: "XAF",
  GA: "XAF",
  CG: "XAF",
  TD: "XAF",
  CF: "XAF",
  GQ: "XAF",
  GN: "GNF",
  MA: "MAD",
  FR: "EUR",
  BE: "EUR",
  DE: "EUR",
  ES: "EUR",
  IT: "EUR",
  PT: "EUR",
  NL: "EUR",
  LU: "EUR",
  IE: "EUR",
  AT: "EUR",
  FI: "EUR",
  GR: "EUR",
  CH: "CHF",
  GB: "GBP",
  US: "USD",
  CA: "CAD",
};

/** Fallback Zawena lorsque le pays est indéterminé. */
export const FALLBACK_CURRENCY: DisplayCurrency = "XOF";

/**
 * Taux de référence internes : unités de devise pour 1 XOF.
 * XOF/XAF sont indexés sur l'euro (parité fixe 655,957) ; les autres valeurs
 * sont des ordres de grandeur révisés manuellement.
 */
export const RATES_UPDATED_AT = "2026-08-01";
export const INDICATIVE_RATES: Record<DisplayCurrency, number> = {
  XOF: 1,
  XAF: 1,
  EUR: 1 / 655.957,
  USD: 0.00165,
  GBP: 0.0013,
  CHF: 0.00145,
  CAD: 0.00225,
  MAD: 0.0155,
  GNF: 13.5,
};

/* ----------------------------- Tranches budget ---------------------------- */

export interface BudgetTier {
  key: string;
  /** Bornes en devise de référence (XOF). `null` = ouvert. */
  min: number | null;
  max: number | null;
}

/** Table de prix centralisée : aucune duplication dans les composants. */
export const BUDGET_TIERS: readonly BudgetTier[] = [
  { key: "under_3m", min: null, max: 3_000_000 },
  { key: "3m_10m", min: 3_000_000, max: 10_000_000 },
  { key: "10m_33m", min: 10_000_000, max: 33_000_000 },
  { key: "over_33m", min: 33_000_000, max: null },
  { key: "to_define", min: null, max: null },
] as const;

export const BUDGET_TIER_KEYS = BUDGET_TIERS.map((tier) => tier.key) as [string, ...string[]];

export function budgetTier(key: string): BudgetTier | undefined {
  return BUDGET_TIERS.find((tier) => tier.key === key);
}

export function isDisplayCurrency(value: string): value is DisplayCurrency {
  return (DISPLAY_CURRENCIES as readonly string[]).includes(value);
}

export function currencyForCountry(country: string | null | undefined): DisplayCurrency {
  if (!country) return FALLBACK_CURRENCY;
  return COUNTRY_CURRENCY[country.trim().toUpperCase()] ?? FALLBACK_CURRENCY;
}

/** Signal secondaire : locale du navigateur (ex. "fr-CI" → XOF). */
export function currencyFromLocale(locale: string | null | undefined): DisplayCurrency | null {
  if (!locale) return null;
  const region = locale.split("-")[1];
  if (!region) return null;
  return COUNTRY_CURRENCY[region.toUpperCase()] ?? null;
}

function roundTo(value: number, step: number): number {
  return Math.max(step, Math.round(value / step) * step);
}

/** Conversion indicative depuis la devise de référence. */
export function convertFromReference(amountXof: number, currency: DisplayCurrency): number {
  const meta = CURRENCY_META[currency];
  return roundTo(amountXof * INDICATIVE_RATES[currency], meta.step);
}

export function formatAmount(amount: number, currency: DisplayCurrency): string {
  const meta = CURRENCY_META[currency];
  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Libellé affiché d'une tranche, dans la devise du visiteur. */
export function formatBudgetTier(key: string, currency: DisplayCurrency): string {
  const tier = budgetTier(key);
  if (!tier) return "À définir ensemble";
  if (tier.min === null && tier.max === null) return "À définir ensemble";
  if (tier.min === null && tier.max !== null) {
    return `< ${formatAmount(convertFromReference(tier.max, currency), currency)}`;
  }
  if (tier.max === null && tier.min !== null) {
    return `> ${formatAmount(convertFromReference(tier.min, currency), currency)}`;
  }
  return `${formatAmount(convertFromReference(tier.min!, currency), currency)} – ${formatAmount(
    convertFromReference(tier.max!, currency),
    currency,
  )}`;
}

/**
 * Libellé canonique stocké en base : toujours en devise de référence, avec la
 * devise consultée par le visiteur à titre d'information commerciale.
 */
export function canonicalBudgetLabel(key: string, viewedIn?: string): string {
  const reference = formatBudgetTier(key, REFERENCE_CURRENCY);
  const suffix = viewedIn && viewedIn !== REFERENCE_CURRENCY ? ` (vu en ${viewedIn})` : "";
  return `${reference}${suffix}`.slice(0, 80);
}
