/**
 * Validations CRM (client-safe, réutilisées côté serveur).
 */
import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email().max(255);
export const phoneSchema = z
  .string()
  .trim()
  .min(6)
  .max(30)
  .regex(/^[+0-9 ()./-]+$/, "Numéro de téléphone invalide");

/**
 * Téléphone facultatif : un champ laissé vide dans un formulaire équivaut à
 * une absence de valeur, sans jamais assouplir la validation d'un vrai numéro.
 */
export const optionalPhoneSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  phoneSchema.optional(),
);

export const leadSourceSchema = z.enum([
  "website",
  "referral",
  "linkedin",
  "email",
  "event",
  "other",
]);
export const leadStatusSchema = z.enum([
  "new",
  "contacted",
  "qualified",
  "unqualified",
  "converted",
]);

export const createLeadSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: emailSchema,
  phone: phoneSchema.optional(),
  companyName: z.string().trim().max(160).optional(),
  message: z.string().trim().max(4000).optional(),
  serviceId: z.string().uuid().optional(),
  source: leadSourceSchema.default("website"),
  utm: z.record(z.string().max(200)).default({}),
});
export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const updateLeadStatusSchema = z.object({
  leadId: z.string().uuid(),
  status: leadStatusSchema,
  note: z.string().trim().max(2000).optional(),
});

export const companySchema = z.object({
  name: z.string().trim().min(2).max(160),
  legalName: z.string().trim().max(200).optional(),
  website: z.string().trim().url().max(255).optional(),
  industry: z.string().trim().max(120).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  city: z.string().trim().max(120).optional(),
  country: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(4000).optional(),
});
export type CompanyInput = z.infer<typeof companySchema>;

export const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().max(80).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  jobTitle: z.string().trim().max(120).optional(),
  companyId: z.string().uuid().optional(),
  isPrimary: z.boolean().default(false),
  notes: z.string().trim().max(4000).optional(),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const opportunitySchema = z.object({
  title: z.string().trim().min(2).max(200),
  companyId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  stageId: z.string().uuid(),
  amount: z.number().nonnegative().max(1_000_000_000).default(0),
  currency: z.enum(["XOF", "EUR", "USD", "GBP"]).default("XOF"),
  expectedCloseDate: z.string().date().optional(),
});
export type OpportunityInput = z.infer<typeof opportunitySchema>;

export const moveOpportunitySchema = z.object({
  opportunityId: z.string().uuid(),
  stageId: z.string().uuid(),
  lossReason: z.string().trim().max(500).optional(),
  note: z.string().trim().max(2000).optional(),
});

export const activitySchema = z.object({
  entityType: z.enum(["lead", "contact", "company", "opportunity", "ticket", "quote"]),
  entityId: z.string().uuid(),
  type: z.enum(["call", "email", "meeting", "demo", "note", "task", "follow_up", "other"]),
  subject: z.string().trim().max(200).optional(),
  body: z.string().trim().max(8000).optional(),
  occurredAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(0).max(1440).optional(),
});
export type ActivityInput = z.infer<typeof activitySchema>;

export const taskSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(4000).optional(),
  entityType: z
    .enum(["lead", "contact", "company", "opportunity", "ticket", "quote", "invoice"])
    .optional(),
  entityId: z.string().uuid().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  dueAt: z.string().datetime().optional(),
  assigneeId: z.string().uuid().optional(),
});
export type TaskInput = z.infer<typeof taskSchema>;

export const updateTaskStatusSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(["todo", "in_progress", "done", "cancelled"]),
});