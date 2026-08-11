/**
 * Distingue « contenu absent » (→ 404 local) d'une panne de lecture CMS
 * (→ état d'erreur local). Les détails techniques ne sont jamais affichés.
 */
export function isMissingContentError(error: unknown): boolean {
  const raw = error as { code?: unknown; message?: unknown } | null;
  const code = typeof raw?.code === "string" ? raw.code : "";
  const message = typeof raw?.message === "string" ? raw.message : "";
  return code === "NOT_FOUND" || /not[_ ]?found|introuvable/i.test(message);
}