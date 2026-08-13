/**
 * Collecte d'événements métier (serveur uniquement).
 * Aucune donnée personnelle : le visiteur n'est identifié que par un hash de
 * session non réversible et facultatif.
 */
import { adminDb } from "../core/context.server";
import { hashIdentifier, enforceRateLimit } from "../core/rate-limit.server";

export const ANALYTICS_EVENTS = [
  "page_view",
  "service_view",
  "project_view",
  "blog_view",
  "cta_clicked",
  "quote_started",
  "quote_submitted",
  "contact_submitted",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export interface TrackInput {
  event: AnalyticsEventName;
  path?: string;
  referrer?: string;
  entityType?: string;
  entityId?: string;
  sessionId?: string;
  props?: Record<string, unknown>;
  /** Empreinte réseau facultative, utilisée uniquement pour l'anti-abus. */
  ipHash?: string;
}

export async function track(input: TrackInput): Promise<void> {
  try {
    // Anti-abus : un visiteur ne peut pas inonder la table d'événements.
    await enforceRateLimit(
      "analytics.track",
      input.ipHash ?? input.sessionId ?? "anonymous",
      120,
      60,
    );
    const db = await adminDb();
    await db.from("analytics_events").insert({
      event_name: input.event,
      path: input.path ?? null,
      referrer: input.referrer ?? null,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      session_hash: input.sessionId ? hashIdentifier(input.sessionId) : null,
      props: (input.props ?? {}) as never,
    });
  } catch (error) {
    console.error("[analytics] enregistrement impossible", error);
  }
}