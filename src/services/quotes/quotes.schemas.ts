/**
 * Validations du module Devis (client-safe, réutilisées côté serveur).
 */
import { z } from "zod";

import { emailSchema, phoneSchema } from "../crm/crm.schemas";

export const currencySchema = z.enum(["XOF", "EUR", "USD", "GBP"]);

/* ------------------------- Demande de devis (public) ---------------------- */

export const quoteRequestSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: emailSchema,
  phone: phoneSchema.optional(),
  companyName: z.string().trim().max(160).optional(),
  serviceId: z.string().uuid().optional(),
  budgetRange: z.string().trim().max(80).optional(),
  timeline: z.string().trim().max(80).optional(),
  description: z.string().trim().min(10).max(6000),
  /** Champ piège anti-robot : doit rester vide. */
  honeypot: z.string().max(0).optional(),
  utm: z.record(z.string().max(200)).default({}),
});
export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

export const quoteRequestStatusSchema = z.enum([
  "new",
  "reviewing",
  "qualified",
  "quote_created",
  "quoted",
  "declined",
  "archived",
]);

export const reviewQuoteRequestSchema = z.object({
  requestId: z.string().uuid(),
  status: quoteRequestStatusSchema,
  note: z.string().trim().max(2000).optional(),
});

/* -------------------------------- Devis ---------------------------------- */

export const quoteItemSchema = z.object({
  serviceId: z.string().uuid().optional(),
  description: z.string().trim().min(2).max(500),
  quantity: z.number().positive().max(100_000),
  unitPrice: z.number().nonnegative().max(1_000_000_000),
  discountPercent: z.number().min(0).max(100).default(0),
});
export type QuoteItemInput = z.infer<typeof quoteItemSchema>;

export const createQuoteSchema = z.object({
  title: z.string().trim().min(2).max(200),
  quoteRequestId: z.string().uuid().optional(),
  opportunityId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  currency: currencySchema.default("XOF"),
  discountAmount: z.number().nonnegative().max(1_000_000_000).default(0),
  taxRate: z.number().min(0).max(100).default(0),
  validUntil: z.string().date().optional(),
  terms: z.string().trim().max(8000).optional(),
  notes: z.string().trim().max(4000).optional(),
  items: z.array(quoteItemSchema).min(1).max(200),
  /** Clé d'idempotence fournie par le client pour éviter les doubles envois. */
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
});
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;

export const updateQuoteDraftSchema = z.object({
  quoteId: z.string().uuid(),
  lockVersion: z.number().int().nonnegative(),
  title: z.string().trim().min(2).max(200).optional(),
  discountAmount: z.number().nonnegative().max(1_000_000_000).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  validUntil: z.string().date().optional(),
  terms: z.string().trim().max(8000).optional(),
  notes: z.string().trim().max(4000).optional(),
  /** Remplacement complet des lignes (transactionnel côté service). */
  items: z.array(quoteItemSchema).min(1).max(200).optional(),
});
export type UpdateQuoteDraftInput = z.infer<typeof updateQuoteDraftSchema>;

export const sendQuoteSchema = z.object({
  quoteId: z.string().uuid(),
  lockVersion: z.number().int().nonnegative(),
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
});

export const decideQuoteSchema = z.object({
  quoteId: z.string().uuid(),
  decision: z.enum(["accepted", "rejected", "cancelled"]),
  reason: z.string().trim().max(1000).optional(),
  lockVersion: z.number().int().nonnegative().optional(),
});