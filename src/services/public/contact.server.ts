/**
 * Point d'entrée public du formulaire de contact (serveur uniquement).
 * Réutilise la logique CRM existante : aucune règle métier dupliquée ici.
 */
import { adminDb } from "../core/context.server";
import { validationError } from "../core/errors";
import { enforceRateLimit, looksLikeSpam } from "../core/rate-limit.server";
import { createOrEnrichLead } from "../crm/crm.server";
import type { ContactRequestInput } from "./public.schemas";

export async function submitContactRequest(
  input: ContactRequestInput,
  meta: { ipHash?: string | undefined } = {},
): Promise<{ leadId: string; duplicate: boolean }> {
  if (looksLikeSpam({ honeypot: input.honeypot, message: input.message, fullName: input.fullName })) {
    throw validationError("Demande rejetée");
  }
  await enforceRateLimit("contact_request", meta.ipHash ?? input.email, 5, 3600);

  const db = await adminDb();
  return createOrEnrichLead(
    db,
    {
      fullName: input.fullName,
      email: input.email,
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.companyName ? { companyName: input.companyName } : {}),
      message: `[${input.subject}] ${input.message}`,
      ...(input.serviceId ? { serviceId: input.serviceId } : {}),
      source: "website",
      utm: input.utm,
    },
    null,
  );
}
