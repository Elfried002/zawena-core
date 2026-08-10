/**
 * Validations du module Support (client-safe).
 */
import { z } from "zod";

import { emailSchema } from "../crm/crm.schemas";

export const prioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const ticketStatusSchema = z.enum([
  "open",
  "assigned",
  "in_progress",
  "waiting_customer",
  "pending",
  "resolved",
  "closed",
]);

export const createTicketSchema = z.object({
  subject: z.string().trim().min(4).max(200),
  description: z.string().trim().min(10).max(8000),
  categoryId: z.string().uuid().optional(),
  priority: prioritySchema.default("medium"),
  /** Requis pour un demandeur non authentifié (formulaire public). */
  requesterEmail: emailSchema.optional(),
  companyId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  honeypot: z.string().max(0).optional(),
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
});
export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const assignTicketSchema = z.object({
  ticketId: z.string().uuid(),
  assigneeId: z.string().uuid(),
});

export const changeTicketStatusSchema = z.object({
  ticketId: z.string().uuid(),
  status: ticketStatusSchema,
  note: z.string().trim().max(2000).optional(),
});

export const replyTicketSchema = z.object({
  ticketId: z.string().uuid(),
  body: z.string().trim().min(1).max(8000),
  /** Note interne : jamais visible par le demandeur. */
  isInternal: z.boolean().default(false),
  /** Pièces jointes déjà déposées dans Storage (bucket `documents`). */
  attachmentMediaIds: z.array(z.string().uuid()).max(10).default([]),
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
});
export type ReplyTicketInput = z.infer<typeof replyTicketSchema>;