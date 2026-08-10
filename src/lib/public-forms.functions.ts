/**
 * Server functions des formulaires publics.
 * Elles délèguent intégralement aux services métier existants et ne renvoient
 * jamais une erreur technique brute au navigateur.
 */
import { createServerFn } from "@tanstack/react-start";

import { contactRequestSchema, publicQuoteFormSchema } from "@/services/public/public.schemas";

import { toPublicError } from "@/services/core/errors";
import { ipHashFromRequest } from "@/services/public/request.server";

export interface SubmitResult {
  ok: boolean;
  code?: string;
  message?: string;
}

export const submitContactRequestFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactRequestSchema.parse(data))
  .handler(async ({ data }): Promise<SubmitResult> => {
    try {
      const { submitContactRequest } = await import("@/services/public/contact.server");
      await submitContactRequest(data, { ipHash: ipHashFromRequest() });
      return { ok: true };
    } catch (error) {
      const payload = toPublicError(error);
      return { ok: false, code: payload.code, message: payload.message };
    }
  });

export const submitQuoteRequestFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => publicQuoteFormSchema.parse(data))
  .handler(async ({ data }): Promise<SubmitResult> => {
    try {
      const { adminDb } = await import("@/services/core/context.server");
      const { submitQuoteRequest } = await import("@/services/quotes/quotes.server");
      const { resolveServiceId } = await import("@/services/public/public.server");
      const db = await adminDb();
      const { serviceSlug, ...rest } = data;
      const serviceId = serviceSlug ? await resolveServiceId(serviceSlug) : undefined;
      await submitQuoteRequest(db, serviceId ? { ...rest, serviceId } : rest, {
        ipHash: ipHashFromRequest(),
      });
      return { ok: true };
    } catch (error) {
      const payload = toPublicError(error);
      return { ok: false, code: payload.code, message: payload.message };
    }
  });
