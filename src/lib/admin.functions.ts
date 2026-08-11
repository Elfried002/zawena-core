/**
 * Server functions de lecture du back-office.
 * Chaque handler exige une session valide (middleware) puis délègue au service
 * métier qui vérifie la permission côté serveur.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ADMIN_RESOURCES, type AdminResource } from "@/services/admin/admin-resources";

const listInputSchema = z.object({
  resource: z.enum(ADMIN_RESOURCES),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
  search: z.string().trim().max(120).optional(),
  sortBy: z.string().trim().max(60).optional(),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
  filters: z.record(z.string().max(120)).default({}),
});

export const getMyContextFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getMyContext } = await import("@/services/admin/admin.server");
    return getMyContext({ supabase: context.supabase, userId: context.userId });
  });

export const adminListFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => listInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { adminList } = await import("@/services/admin/admin-reads.server");
    return adminList({ supabase: context.supabase, userId: context.userId }, {
      ...data,
      resource: data.resource as AdminResource,
    });
  });

export const adminDashboardFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { dashboard } = await import("@/services/admin/admin-reads.server");
    return dashboard({ supabase: context.supabase, userId: context.userId });
  });

export const leadDetailFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { leadDetail } = await import("@/services/admin/admin-reads.server");
    return leadDetail({ supabase: context.supabase, userId: context.userId }, data.id);
  });

export const companyDetailFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { companyDetail } = await import("@/services/admin/admin-reads.server");
    return companyDetail({ supabase: context.supabase, userId: context.userId }, data.id);
  });

export const quoteDetailFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const ctx = { supabase: context.supabase, userId: context.userId };
    const { getQuote, getQuoteHistory } = await import("@/services/quotes/quotes.server");
    const [quote, history] = await Promise.all([
      getQuote(ctx, data.id),
      getQuoteHistory(ctx, data.id),
    ]);
    return { quote, history };
  });

export const invoiceDetailFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const ctx = { supabase: context.supabase, userId: context.userId };
    const { getInvoice, listPayments } = await import("@/services/finance/finance.server");
    const [invoice, payments] = await Promise.all([
      getInvoice(ctx, data.id),
      listPayments(ctx, data.id),
    ]);
    return { invoice, payments };
  });

export const ticketDetailFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const ctx = { supabase: context.supabase, userId: context.userId };
    const { getTicket } = await import("@/services/support/support.server");
    const { assignableUsers } = await import("@/services/admin/admin-reads.server");
    const [ticket, users] = await Promise.all([
      getTicket(ctx, data.id, { includeInternal: true }),
      assignableUsers(ctx),
    ]);
    return { ...ticket, users };
  });

export const pipelineBoardFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = { supabase: context.supabase, userId: context.userId };
    const { pipelineStages, adminList } = await import("@/services/admin/admin-reads.server");
    const [stages, opportunities] = await Promise.all([
      pipelineStages(ctx),
      adminList(ctx, { resource: "opportunities", page: 1, pageSize: 100, sortDir: "desc" }),
    ]);
    return { stages, opportunities: opportunities.items };
  });

export const analyticsOverviewFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { analyticsOverview } = await import("@/services/admin/admin-reads.server");
    return analyticsOverview({ supabase: context.supabase, userId: context.userId });
  });

export const rolesOverviewFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = { supabase: context.supabase, userId: context.userId };
    const { rolePermissionMatrix } = await import("@/services/admin/admin.server");
    return rolePermissionMatrix(ctx);
  });

export const usersOverviewFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        page: z.number().int().min(1).default(1),
        search: z.string().trim().max(120).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const ctx = { supabase: context.supabase, userId: context.userId };
    const { adminList, userRoleMap } = await import("@/services/admin/admin-reads.server");
    const [users, roles] = await Promise.all([
      adminList(ctx, { resource: "users", page: data.page, pageSize: 25, ...(data.search ? { search: data.search } : {}) }),
      userRoleMap(ctx),
    ]);
    return { users, roles };
  });

export const assignableUsersFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assignableUsers } = await import("@/services/admin/admin-reads.server");
    return assignableUsers({ supabase: context.supabase, userId: context.userId });
  });

export const pipelineStagesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { pipelineStages } = await import("@/services/admin/admin-reads.server");
    return pipelineStages({ supabase: context.supabase, userId: context.userId });
  });
export const contentDetailFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        entity: z.enum(["pages", "services", "projects", "blog_posts", "faqs"]),
        id: z.string().uuid(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { contentDetail } = await import("@/services/cms/cms.server");
    return contentDetail({ supabase: context.supabase, userId: context.userId }, data.entity, data.id);
  });

export const cmsRefsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { cmsRefs } = await import("@/services/cms/cms.server");
    return cmsRefs({ supabase: context.supabase, userId: context.userId });
  });

/** Notifications de l'utilisateur courant (RLS : lignes personnelles uniquement). */
export const myNotificationsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ onlyUnread: z.boolean().default(false) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    let query = context.supabase
      .from("notifications")
      .select("id, event, channel, title, body, link, entity_type, entity_id, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data.onlyUnread) query = query.is("read_at", null);
    const { data: rows, error } = await query;
    if (error) throw error;
    const items = rows ?? [];
    return { items, unread: items.filter((n) => !n.read_at).length };
  });
