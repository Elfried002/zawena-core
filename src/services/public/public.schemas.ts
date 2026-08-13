/**
 * Validations des formulaires publics (client-safe, réutilisées côté serveur).
 */
import { z } from "zod";

import { emailSchema, phoneSchema } from "../crm/crm.schemas";
import { quoteRequestSchema } from "../quotes/quotes.schemas";

export const CONTACT_SUBJECTS = [
  "Demande d'information",
  "Projet IA ou automatisation",
  "Développement logiciel",
  "Cybersécurité",
  "Conseil et cadrage",
  "Partenariat",
] as const;

export const contactRequestSchema = z.object({
  fullName: z.string().trim().min(2, "Indiquez votre nom complet").max(120),
  companyName: z.string().trim().max(160).optional(),
  email: emailSchema,
  phone: optionalPhoneSchema,
  subject: z.enum(CONTACT_SUBJECTS),
  message: z.string().trim().min(20, "Décrivez votre besoin en quelques phrases").max(4000),
  serviceId: z.string().uuid().optional(),
  honeypot: z.string().max(0).optional(),
  utm: z.record(z.string().max(200)).default({}),
});
export type ContactRequestInput = z.infer<typeof contactRequestSchema>;

export const BUDGET_RANGES = [
  "< 5 000 €",
  "5 000 – 15 000 €",
  "15 000 – 50 000 €",
  "> 50 000 €",
  "À définir ensemble",
] as const;

export const TIMELINES = [
  "Dès que possible",
  "Sous 1 à 3 mois",
  "Sous 3 à 6 mois",
  "Plus tard / exploration",
] as const;

/**
 * Formulaire de devis public : le navigateur ne connaît que le slug du service,
 * jamais son identifiant interne. La résolution slug → id se fait côté serveur.
 */
export const publicQuoteFormSchema = quoteRequestSchema
  .omit({ serviceId: true })
  .extend({ serviceSlug: z.string().trim().max(160).optional() });
export type PublicQuoteFormInput = z.infer<typeof publicQuoteFormSchema>;
