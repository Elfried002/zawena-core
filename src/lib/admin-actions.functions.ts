/**
 * Server functions de mutation du back-office.
 * Toutes les règles métier (permissions, transitions, calculs) restent dans les
 * services serveur : ces handlers ne font que valider l'entrée et déléguer.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { toPublicError } from "@/services/core/errors";
import { APP_ROLES } from "@/services/core/permissions";
import {
  companySchema,
  contactSchema,
  createLeadSchema,
  activitySchema,
  moveOpportunitySchema,
  opportunitySchema,
  taskSchema,
  updateLeadStatusSchema,
  updateTaskStatusSchema,
} from "@/services/crm/crm.schemas";
import {
  createQuoteSchema,
  decideQuoteSchema,
  reviewQuoteRequestSchema,
  sendQuoteSchema,
  updateQuoteDraftSchema,
} from "@/services/quotes/quotes.schemas";
import {
  changeInvoiceStatusSchema,
  createInvoiceSchema,
  invoiceFromQuoteSchema,
  recordPaymentSchema,
} from "@/services/finance/finance.schemas";
import {
  assignTicketSchema,
  changeTicketStatusSchema,
  replyTicketSchema,
} from "@/services/support/support.schemas";
import {
  blogPostSchema,
  faqSchema,
  pageSchema,
  projectSchema,
  publishSchema,
  serviceSchema,
  CMS_ENTITIES,
} from "@/services/cms/cms.schemas";

const idSchema = z.object({ id: z.string().uuid() });

export const updateLeadStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateLeadStatusSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { updateLeadStatus } = await import("@/services/crm/crm.server");
      await updateLeadStatus({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const convertLeadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        leadId: z.string().uuid(),
        companyId: z.string().uuid().optional(),
        stageId: z.string().uuid(),
        amount: z.number().nonnegative().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    try {
      const { convertLead } = await import("@/services/crm/crm.server");
      const result = await convertLead({ supabase: context.supabase, userId: context.userId }, {
        leadId: data.leadId,
        stageId: data.stageId,
        ...(data.companyId ? { companyId: data.companyId } : {}),
        ...(data.amount !== undefined ? { amount: data.amount } : {}),
      });
      return { ok: true as const, ...result };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const createLeadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createLeadSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { createOrEnrichLead } = await import("@/services/crm/crm.server");
      const result = await createOrEnrichLead(context.supabase, data, context.userId);
      return { ok: true as const, ...result };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const createCompanyFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => companySchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { createCompany } = await import("@/services/crm/crm.server");
      const result = await createCompany({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const, ...result };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const createContactFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { createContact } = await import("@/services/crm/crm.server");
      const result = await createContact({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const, ...result };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const createOpportunityFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => opportunitySchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { createOpportunity } = await import("@/services/crm/crm.server");
      const result = await createOpportunity(
        { supabase: context.supabase, userId: context.userId },
        data,
      );
      return { ok: true as const, ...result };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const moveOpportunityFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => moveOpportunitySchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { moveOpportunity } = await import("@/services/crm/crm.server");
      await moveOpportunity({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const logActivityFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => activitySchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { logActivity } = await import("@/services/crm/crm.server");
      await logActivity({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const createTaskFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => taskSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { createTask } = await import("@/services/crm/crm.server");
      const result = await createTask({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const, ...result };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const updateTaskStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateTaskStatusSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { updateTaskStatus } = await import("@/services/crm/crm.server");
      await updateTaskStatus({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

/* ---------------------------------- Devis --------------------------------- */

export const reviewQuoteRequestFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => reviewQuoteRequestSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { reviewQuoteRequest } = await import("@/services/quotes/quotes.server");
      await reviewQuoteRequest({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const createQuoteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createQuoteSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { createQuote } = await import("@/services/quotes/quotes.server");
      const result = await createQuote({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const, ...result };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const updateQuoteDraftFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateQuoteDraftSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { updateQuoteDraft } = await import("@/services/quotes/quotes.server");
      const result = await updateQuoteDraft(
        { supabase: context.supabase, userId: context.userId },
        data,
      );
      return { ok: true as const, ...result };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const sendQuoteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => sendQuoteSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { sendQuote } = await import("@/services/quotes/quotes.server");
      const result = await sendQuote({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const, ...result };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const reviseQuoteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ quoteId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { reviseQuote } = await import("@/services/quotes/quotes.server");
      const result = await reviseQuote({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const, ...result };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const decideQuoteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => decideQuoteSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { decideQuote } = await import("@/services/quotes/quotes.server");
      await decideQuote({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

/* --------------------------------- Finance -------------------------------- */

export const createInvoiceFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createInvoiceSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { createInvoice } = await import("@/services/finance/finance.server");
      const result = await createInvoice({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const, ...result };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const invoiceFromQuoteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => invoiceFromQuoteSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { createInvoiceFromQuote } = await import("@/services/finance/finance.server");
      const result = await createInvoiceFromQuote(
        { supabase: context.supabase, userId: context.userId },
        data,
      );
      return { ok: true as const, ...result };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const changeInvoiceStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => changeInvoiceStatusSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { changeInvoiceStatus } = await import("@/services/finance/finance.server");
      await changeInvoiceStatus({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const recordPaymentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => recordPaymentSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { recordPayment } = await import("@/services/finance/finance.server");
      const result = await recordPayment({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const, ...result };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

/* --------------------------------- Support -------------------------------- */

export const assignTicketFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => assignTicketSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { assignTicket } = await import("@/services/support/support.server");
      await assignTicket({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const changeTicketStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => changeTicketStatusSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { changeTicketStatus } = await import("@/services/support/support.server");
      await changeTicketStatus({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const replyTicketFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => replyTicketSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { replyToTicket } = await import("@/services/support/support.server");
      const result = await replyToTicket({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const, ...result };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

/* ----------------------------------- CMS ---------------------------------- */

export const createContentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .discriminatedUnion("entity", [
        z.object({ entity: z.literal("pages"), payload: pageSchema }),
        z.object({ entity: z.literal("services"), payload: serviceSchema }),
        z.object({ entity: z.literal("projects"), payload: projectSchema }),
        z.object({ entity: z.literal("blog_posts"), payload: blogPostSchema }),
        z.object({ entity: z.literal("faqs"), payload: faqSchema }),
      ])
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const ctx = { supabase: context.supabase, userId: context.userId };
    try {
      const cms = await import("@/services/cms/cms.server");
      switch (data.entity) {
        case "pages":
          return { ok: true as const, ...(await cms.createPage(ctx, data.payload)) };
        case "services":
          return { ok: true as const, ...(await cms.createService(ctx, data.payload)) };
        case "projects":
          return { ok: true as const, ...(await cms.createProject(ctx, data.payload)) };
        case "blog_posts":
          return { ok: true as const, ...(await cms.createBlogPost(ctx, data.payload)) };
        case "faqs":
          return { ok: true as const, ...(await cms.createFaq(ctx, data.payload)) };
      }
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const updatePageFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), payload: pageSchema }).parse(data),
  )
  .handler(async ({ data, context }) => {
    try {
      const { updatePage } = await import("@/services/cms/cms.server");
      await updatePage({ supabase: context.supabase, userId: context.userId }, data.id, data.payload);
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const changeContentStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => publishSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { changeContentStatus } = await import("@/services/cms/cms.server");
      await changeContentStatus({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const archiveContentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ entity: z.enum(CMS_ENTITIES), id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    try {
      const { archiveContent } = await import("@/services/cms/cms.server");
      await archiveContent({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const signedMediaUrlFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      const { signedMediaUrl } = await import("@/services/cms/cms.server");
      const url = await signedMediaUrl(
        { supabase: context.supabase, userId: context.userId },
        data.id,
      );
      return { ok: true as const, url };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

/* -------------------------- Utilisateurs & profil ------------------------- */

export const updateMyProfileFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        fullName: z.string().trim().max(120).optional(),
        jobTitle: z.string().trim().max(120).optional(),
        phone: z.string().trim().max(40).optional(),
        locale: z.enum(["fr", "en"]).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    try {
      const { updateMyProfile } = await import("@/services/admin/admin.server");
      await updateMyProfile({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const setUserStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        status: z.enum(["invited", "active", "suspended", "deactivated"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    try {
      const { setUserStatus } = await import("@/services/admin/admin.server");
      await setUserStatus({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const setUserRoleFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        role: z.enum(APP_ROLES),
        grant: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    try {
      const { setUserRole } = await import("@/services/admin/admin.server");
      await setUserRole({ supabase: context.supabase, userId: context.userId }, data);
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const, error: toPublicError(error) };
    }
  });

export const markNotificationReadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) return { ok: false as const, error: toPublicError(error) };
    return { ok: true as const };
  });