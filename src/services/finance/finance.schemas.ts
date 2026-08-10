/**
 * Validations du module Finance (client-safe).
 */
import { z } from "zod";

import { currencySchema } from "../quotes/quotes.schemas";

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(2).max(500),
  quantity: z.number().positive().max(100_000),
  unitPrice: z.number().nonnegative().max(1_000_000_000),
});
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;

export const createInvoiceSchema = z.object({
  companyId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  quoteId: z.string().uuid().optional(),
  currency: currencySchema.default("XOF"),
  taxRate: z.number().min(0).max(100).default(0),
  issueDate: z.string().date().optional(),
  dueDate: z.string().date().optional(),
  notes: z.string().trim().max(4000).optional(),
  items: z.array(invoiceItemSchema).min(1).max(200),
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
});
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const invoiceFromQuoteSchema = z.object({
  quoteId: z.string().uuid(),
  dueInDays: z.number().int().min(0).max(365).default(30),
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
});

export const invoiceStatusSchema = z.enum([
  "draft",
  "issued",
  "sent",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
]);

export const changeInvoiceStatusSchema = z.object({
  invoiceId: z.string().uuid(),
  status: invoiceStatusSchema,
  lockVersion: z.number().int().nonnegative().optional(),
});

/**
 * Paiement enregistré manuellement (V1).
 * `provider` / `providerReference` sont réservés à une future passerelle :
 * la forme des données n'aura pas à changer lors de l'intégration.
 */
export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive().max(1_000_000_000),
  method: z.enum(["bank_transfer", "card", "cash", "paypal", "stripe", "other"]).default(
    "bank_transfer",
  ),
  reference: z.string().trim().max(200).optional(),
  paidAt: z.string().datetime().optional(),
  notes: z.string().trim().max(2000).optional(),
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
});
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;