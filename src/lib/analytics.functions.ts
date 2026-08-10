/**
 * Suivi d'événements métier anonymisés (aucune donnée personnelle collectée).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const trackSchema = z.object({
  event: z.enum([
    "page_view",
    "service_view",
    "project_view",
    "blog_view",
    "cta_clicked",
    "quote_started",
    "quote_submitted",
    "contact_submitted",
  ]),
  path: z.string().max(300).optional(),
  entityType: z.string().max(40).optional(),
  entityId: z.string().max(160).optional(),
  sessionId: z.string().max(80).optional(),
});

export const trackEventFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => trackSchema.parse(data))
  .handler(async ({ data }) => {
    const { track } = await import("@/services/analytics/analytics.server");
    await track({
      event: data.event,
      ...(data.path ? { path: data.path } : {}),
      ...(data.entityType ? { entityType: data.entityType } : {}),
      ...(data.entityId ? { entityId: data.entityId } : {}),
      ...(data.sessionId ? { sessionId: data.sessionId } : {}),
    });
    return { ok: true };
  });
