/**
 * Anti-abus des points d'entrée publics (serveur uniquement).
 * L'identifiant est haché : aucune IP ni email en clair dans la table.
 */
import { createHash } from "crypto";

import { adminDb } from "./context.server";
import { rateLimited } from "./errors";

export function hashIdentifier(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex").slice(0, 32);
}

export async function enforceRateLimit(
  scope: string,
  identifier: string,
  maxHits: number,
  windowSeconds: number,
): Promise<void> {
  const db = await adminDb();
  const { data, error } = await db.rpc("check_rate_limit", {
    _scope: scope,
    _identifier: hashIdentifier(identifier),
    _max_hits: maxHits,
    _window_seconds: windowSeconds,
  });
  if (error) {
    console.error("[rate-limit] vérification impossible", error);
    return; // ne bloque pas un visiteur légitime si le contrôle échoue
  }
  if (!data) throw rateLimited();
}

/** Heuristique anti-spam simple : honeypot, longueur et liens excessifs. */
export function looksLikeSpam(input: {
  honeypot?: string | undefined;
  message?: string | undefined;
  fullName?: string | undefined;
}): boolean {
  if (input.honeypot && input.honeypot.trim().length > 0) return true;
  const message = input.message ?? "";
  const linkCount = (message.match(/https?:\/\//gi) ?? []).length;
  if (linkCount > 3) return true;
  if (/\b(viagra|casino|crypto airdrop|seo services)\b/i.test(message)) return true;
  if ((input.fullName ?? "").includes("http")) return true;
  return false;
}