/**
 * Représentation monétaire (client-safe).
 * Les montants sont manipulés en **unités mineures entières** dans la logique
 * métier pour éviter toute imprécision flottante, puis convertis au format
 * décimal attendu par les colonnes `numeric(14,2)` de PostgreSQL.
 */
export const SUPPORTED_CURRENCIES = ["XOF", "EUR", "USD", "GBP"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];
export const DEFAULT_CURRENCY: Currency = "XOF";

/** Nombre de décimales par devise (XOF n'a pas de subdivision courante). */
const EXPONENTS: Record<Currency, number> = { XOF: 0, EUR: 2, USD: 2, GBP: 2 };

export function minorUnitFactor(currency: Currency): number {
  return 10 ** EXPONENTS[currency];
}

/** 12.34 EUR → 1234 */
export function toMinorUnits(amount: number, currency: Currency): number {
  return Math.round(amount * minorUnitFactor(currency));
}

/** 1234 (EUR) → 12.34 */
export function fromMinorUnits(minor: number, currency: Currency): number {
  return minor / minorUnitFactor(currency);
}

/** Arrondi bancaire à 2 décimales pour les colonnes numeric(14,2). */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function isSupportedCurrency(value: string): value is Currency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

export function formatMoney(amount: number, currency: Currency, locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: EXPONENTS[currency],
  }).format(amount);
}

/** Total d'une ligne : quantité × prix unitaire − remise %, arrondi à 2 décimales. */
export function lineTotal(quantity: number, unitPrice: number, discountPercent = 0): number {
  return round2(quantity * unitPrice * (1 - discountPercent / 100));
}