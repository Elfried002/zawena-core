/**
 * Lectures back-office (serveur uniquement).
 * Chaque lecture exige une permission explicite et projette uniquement les
 * colonnes nécessaires : aucune requête « select * » générique n'est exposée.
 */
import { notFound } from "@/services/core/errors";
import { requirePermission } from "@/services/core/guard.server";
import type { Permission } from "@/services/core/permissions";
import type { ServiceContext } from "@/services/core/context.server";
import {
  listParamsSchema,
  likePattern,
  paginate,
  rangeFor,
  type ListParams,
  type Paginated,
} from "@/services/core/query";
import { loose } from "./admin.server";
import { ADMIN_RESOURCES, type AdminResource, type AdminRow } from "./admin-resources";
export { ADMIN_RESOURCES };
export type { AdminResource, AdminRow };


interface ResourceConfig {
  table: string;
  permission: Permission;
  select: string;
  search: string[];
  filters: string[];
  defaultSort: string;
  softDelete?: boolean;
}

const RESOURCES: Record<AdminResource, ResourceConfig> = {
  leads: {
    table: "leads",
    permission: "leads.read",
    select:
      "id, full_name, email, phone, company_name, source, status, score, owner_id, created_at, updated_at",
    search: ["full_name", "email", "company_name"],
    filters: ["status", "source"],
    defaultSort: "created_at",
    softDelete: true,
  },
  companies: {
    table: "companies",
    permission: "companies.read",
    select:
      "id, name, website, industry, size_range, email, phone, city, country, owner_id, created_at",
    search: ["name", "email", "website", "industry"],
    filters: ["industry"],
    defaultSort: "created_at",
    softDelete: true,
  },
  contacts: {
    table: "contacts",
    permission: "contacts.read",
    select:
      "id, first_name, last_name, email, phone, job_title, is_primary, company_id, created_at, companies(name)",
    search: ["first_name", "last_name", "email"],
    filters: ["company_id"],
    defaultSort: "created_at",
    softDelete: true,
  },
  opportunities: {
    table: "opportunities",
    permission: "opportunities.read",
    select:
      "id, title, amount, currency, stage_id, company_id, contact_id, expected_close_date, closed_at, owner_id, created_at, pipeline_stages(name, key, sort_order, is_won, is_lost), companies(name)",
    search: ["title"],
    filters: ["stage_id", "company_id"],
    defaultSort: "created_at",
    softDelete: true,
  },
  activities: {
    table: "activities",
    permission: "activities.read",
    select:
      "id, entity_type, entity_id, type, subject, body, occurred_at, duration_minutes, owner_id, created_at",
    search: ["subject", "body"],
    filters: ["type", "entity_type"],
    defaultSort: "occurred_at",
    softDelete: true,
  },
  tasks: {
    table: "tasks",
    permission: "tasks.read",
    select:
      "id, title, description, status, priority, due_at, completed_at, assignee_id, entity_type, entity_id, created_at",
    search: ["title", "description"],
    filters: ["status", "priority", "assignee_id"],
    defaultSort: "due_at",
    softDelete: true,
  },
  quote_requests: {
    table: "quote_requests",
    permission: "quote_requests.read",
    select:
      "id, full_name, email, company_name, service_id, budget_range, timeline, description, status, lead_id, owner_id, created_at, services(title)",
    search: ["full_name", "email", "company_name"],
    filters: ["status", "service_id"],
    defaultSort: "created_at",
    softDelete: true,
  },
  quotes: {
    table: "quotes",
    permission: "quotes.read",
    select:
      "id, number, title, status, currency, total, version, revision_of, valid_until, sent_at, accepted_at, company_id, created_at, companies(name)",
    search: ["number", "title"],
    filters: ["status", "company_id"],
    defaultSort: "created_at",
    softDelete: true,
  },
  invoices: {
    table: "invoices",
    permission: "invoices.read",
    select:
      "id, number, status, currency, total, amount_paid, issue_date, due_date, company_id, quote_id, created_at, companies(name)",
    search: ["number"],
    filters: ["status", "company_id"],
    defaultSort: "created_at",
    softDelete: true,
  },
  payments: {
    table: "payments",
    permission: "payments.read",
    select:
      "id, invoice_id, amount, currency, method, reference, paid_at, notes, created_at, invoices(number, status)",
    search: ["reference"],
    filters: ["method", "invoice_id"],
    defaultSort: "paid_at",
  },
  tickets: {
    table: "tickets",
    permission: "tickets.read",
    select:
      "id, number, subject, status, priority, requester_email, company_id, assignee_id, first_response_at, resolved_at, closed_at, created_at, updated_at, ticket_categories(name)",
    search: ["number", "subject", "requester_email"],
    filters: ["status", "priority", "assignee_id", "category_id"],
    defaultSort: "created_at",
    softDelete: true,
  },
  pages: {
    table: "pages",
    permission: "pages.read",
    select: "id, slug, title, excerpt, status, published_at, sort_order, updated_at",
    search: ["title", "slug"],
    filters: ["status"],
    defaultSort: "updated_at",
  },
  services: {
    table: "services",
    permission: "services.read",
    select:
      "id, slug, title, summary, icon, status, is_featured, published_at, sort_order, updated_at",
    search: ["title", "slug"],
    filters: ["status"],
    defaultSort: "sort_order",
  },
  projects: {
    table: "projects",
    permission: "projects.read",
    select:
      "id, slug, title, client_name, industry, summary, status, is_featured, published_at, sort_order, updated_at",
    search: ["title", "slug", "client_name"],
    filters: ["status"],
    defaultSort: "updated_at",
  },
  blog_posts: {
    table: "blog_posts",
    permission: "blog_posts.read",
    select:
      "id, slug, title, excerpt, status, published_at, reading_minutes, view_count, category_id, updated_at, blog_categories(name)",
    search: ["title", "slug"],
    filters: ["status", "category_id"],
    defaultSort: "updated_at",
  },
  faqs: {
    table: "faqs",
    permission: "faqs.read",
    select: "id, question, answer, category, status, sort_order, service_id, updated_at",
    search: ["question", "answer"],
    filters: ["status", "category"],
    defaultSort: "sort_order",
  },
  media_files: {
    table: "media_files",
    permission: "media.read",
    select:
      "id, bucket_id, storage_path, file_name, mime_type, media_type, size_bytes, width, height, alt_text, folder, created_at",
    search: ["file_name", "alt_text"],
    filters: ["media_type", "bucket_id"],
    defaultSort: "created_at",
    softDelete: true,
  },
  users: {
    table: "profiles",
    permission: "users.read",
    select: "id, email, full_name, job_title, phone, status, is_active, locale, created_at",
    search: ["email", "full_name"],
    filters: ["status"],
    defaultSort: "created_at",
    softDelete: true,
  },
  notifications: {
    table: "notifications",
    permission: "settings.read",
    select:
      "id, event, channel, title, body, entity_type, entity_id, link, read_at, created_at",
    search: ["title", "body"],
    filters: ["event", "channel"],
    defaultSort: "created_at",
  },
};

export interface AdminListInput extends Partial<ListParams> {
  resource: AdminResource;
  filters?: Record<string, string> | undefined;
}

/** Liste paginée générique, filtrée par permission et projection explicite. */
export async function adminList(
  ctx: ServiceContext,
  input: AdminListInput,
): Promise<Paginated<AdminRow>> {
  const config = RESOURCES[input.resource];
  if (!config) throw notFound("Ressource");
  await requirePermission(ctx, config.permission);

  const parsed = listParamsSchema.parse(input);
  const [start, end] = rangeFor(parsed);

  let query = loose(ctx.supabase)
    .from(config.table)
    .select(config.select, { count: "exact" });

  if (config.softDelete) query = query.is("deleted_at", null);

  for (const [key, value] of Object.entries(input.filters ?? {})) {
    if (!value || !config.filters.includes(key)) continue;
    query = query.eq(key, value);
  }

  if (parsed.from) query = query.gte("created_at", parsed.from);
  if (parsed.to) query = query.lte("created_at", parsed.to);

  if (parsed.search && config.search.length > 0) {
    const pattern = likePattern(parsed.search);
    query = query.or(config.search.map((column) => `${column}.ilike.${pattern}`).join(","));
  }

  const sortBy =
    parsed.sortBy && /^[a-z_]+$/.test(parsed.sortBy) ? parsed.sortBy : config.defaultSort;

  const { data, count, error } = await query
    .order(sortBy, { ascending: parsed.sortDir === "asc", nullsFirst: false })
    .range(start, end);
  if (error) throw error;

  return paginate((data ?? []) as AdminRow[], count ?? 0, parsed);
}

/* ------------------------------ Vues détaillées ---------------------------- */

/** Fiche prospect : identité, timeline, tâches, notes et opportunités. */
export async function leadDetail(ctx: ServiceContext, leadId: string) {
  await requirePermission(ctx, "leads.read");
  const db = loose(ctx.supabase);

  const { data: lead } = await db
    .from("leads")
    .select(
      "id, full_name, email, phone, company_name, message, source, status, score, owner_id, service_id, converted_contact_id, converted_company_id, created_at, updated_at, services(title)",
    )
    .eq("id", leadId)
    .maybeSingle();
  if (!lead) throw notFound("Prospect");

  const [activities, tasks, notes, opportunities] = await Promise.all([
    db
      .from("activities")
      .select("id, type, subject, body, occurred_at, created_at")
      .eq("entity_type", "lead")
      .eq("entity_id", leadId)
      .is("deleted_at", null)
      .order("occurred_at", { ascending: false })
      .limit(50),
    db
      .from("tasks")
      .select("id, title, status, priority, due_at, assignee_id")
      .eq("entity_type", "lead")
      .eq("entity_id", leadId)
      .is("deleted_at", null)
      .order("due_at", { ascending: true })
      .limit(50),
    db
      .from("notes")
      .select("id, body, is_pinned, created_at")
      .eq("entity_type", "lead")
      .eq("entity_id", leadId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(50),
    db
      .from("opportunities")
      .select("id, title, amount, currency, stage_id, created_at, pipeline_stages(name)")
      .eq("lead_id", leadId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  return {
    lead,
    activities: activities.data ?? [],
    tasks: tasks.data ?? [],
    notes: notes.data ?? [],
    opportunities: opportunities.data ?? [],
  };
}

export async function companyDetail(ctx: ServiceContext, companyId: string) {
  await requirePermission(ctx, "companies.read");
  const db = loose(ctx.supabase);

  const { data: company } = await db
    .from("companies")
    .select(
      "id, name, legal_name, website, industry, size_range, email, phone, city, country, notes, created_at",
    )
    .eq("id", companyId)
    .maybeSingle();
  if (!company) throw notFound("Entreprise");

  const [contacts, opportunities, quotes, invoices] = await Promise.all([
    db
      .from("contacts")
      .select("id, first_name, last_name, email, phone, job_title, is_primary")
      .eq("company_id", companyId)
      .is("deleted_at", null),
    db
      .from("opportunities")
      .select("id, title, amount, currency, stage_id, pipeline_stages(name)")
      .eq("company_id", companyId)
      .is("deleted_at", null),
    db
      .from("quotes")
      .select("id, number, status, total, currency, created_at")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20),
    db
      .from("invoices")
      .select("id, number, status, total, amount_paid, currency, due_date")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return {
    company,
    contacts: contacts.data ?? [],
    opportunities: opportunities.data ?? [],
    quotes: quotes.data ?? [],
    invoices: invoices.data ?? [],
  };
}

/** Étapes du pipeline (référentiel partagé par le Kanban). */
export async function pipelineStages(ctx: ServiceContext) {
  await requirePermission(ctx, "opportunities.read");
  const { data, error } = await ctx.supabase
    .from("pipeline_stages")
    .select("id, key, name, probability, is_won, is_lost, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Membres du staff assignables (tickets, tâches). */
export async function assignableUsers(ctx: ServiceContext) {
  const { data } = await ctx.supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("full_name", { ascending: true })
    .limit(100);
  return data ?? [];
}

export async function userRoleMap(ctx: ServiceContext) {
  await requirePermission(ctx, "users.read");
  const { data } = await ctx.supabase.from("user_roles").select("user_id, role");
  const map: Record<string, string[]> = {};
  for (const row of data ?? []) {
    map[row.user_id] = [...(map[row.user_id] ?? []), row.role];
  }
  return map;
}

/* -------------------------------- Dashboard ------------------------------- */

export interface DashboardData {
  kpis: {
    newLeads: number;
    openQuoteRequests: number;
    openOpportunities: number;
    outstandingInvoices: number;
    openTickets: number;
    draftContent: number;
  };
  attention: {
    quoteRequests: AdminRow[];
    tickets: AdminRow[];
    overdueInvoices: AdminRow[];
    dueTasks: AdminRow[];
  };
  recent: Array<{
    id: string;
    module: string;
    action: string;
    tableName: string | null;
    recordId: string | null;
    createdAt: string;
  }>;
}

async function countOf(
  ctx: ServiceContext,
  table: string,
  apply: (query: any) => any,
): Promise<number> {
  try {
    const { count } = await apply(
      loose(ctx.supabase).from(table).select("id", { count: "exact", head: true }),
    );
    return count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Vue opérationnelle du jour. Toutes les valeurs proviennent de la base :
 * aucune donnée n'est simulée. Les blocs inaccessibles restent vides.
 */
export async function dashboard(ctx: ServiceContext): Promise<DashboardData> {
  const db = loose(ctx.supabase);
  const soon = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString();

  const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await fn();
    } catch {
      return fallback;
    }
  };

  const [
    newLeads,
    openQuoteRequests,
    openOpportunities,
    outstandingInvoices,
    openTickets,
    draftContent,
  ] = await Promise.all([
    countOf(ctx, "leads", (q) => q.is("deleted_at", null).eq("status", "new")),
    countOf(ctx, "quote_requests", (q) =>
      q.is("deleted_at", null).in("status", ["new", "reviewing"]),
    ),
    countOf(ctx, "opportunities", (q) => q.is("deleted_at", null).is("closed_at", null)),
    countOf(ctx, "invoices", (q) =>
      q.is("deleted_at", null).in("status", ["issued", "sent", "partially_paid", "overdue"]),
    ),
    countOf(ctx, "tickets", (q) =>
      q.is("deleted_at", null).in("status", ["open", "assigned", "in_progress", "pending"]),
    ),
    countOf(ctx, "pages", (q) => q.in("status", ["draft", "review"])),
  ]);

  const [quoteRequests, tickets, overdueInvoices, dueTasks, recent] = await Promise.all([
    safe(
      async () =>
        (
          await db
            .from("quote_requests")
            .select("id, full_name, company_name, status, created_at")
            .is("deleted_at", null)
            .in("status", ["new", "reviewing"])
            .order("created_at", { ascending: true })
            .limit(5)
        ).data ?? [],
      [],
    ),
    safe(
      async () =>
        (
          await db
            .from("tickets")
            .select("id, number, subject, priority, status, created_at, first_response_at")
            .is("deleted_at", null)
            .in("status", ["open", "assigned", "in_progress"])
            .order("created_at", { ascending: true })
            .limit(5)
        ).data ?? [],
      [],
    ),
    safe(
      async () =>
        (
          await db
            .from("invoices")
            .select("id, number, total, amount_paid, currency, due_date, status")
            .is("deleted_at", null)
            .in("status", ["overdue", "sent", "issued", "partially_paid"])
            .not("due_date", "is", null)
            .lte("due_date", new Date().toISOString().slice(0, 10))
            .order("due_date", { ascending: true })
            .limit(5)
        ).data ?? [],
      [],
    ),
    safe(
      async () =>
        (
          await db
            .from("tasks")
            .select("id, title, status, priority, due_at")
            .is("deleted_at", null)
            .in("status", ["todo", "in_progress"])
            .not("due_at", "is", null)
            .lte("due_at", soon)
            .order("due_at", { ascending: true })
            .limit(5)
        ).data ?? [],
      [],
    ),
    safe(
      async () =>
        (
          await db
            .from("audit_logs")
            .select("id, module, action, table_name, record_id, created_at")
            .order("created_at", { ascending: false })
            .limit(12)
        ).data ?? [],
      [],
    ),
  ]);

  return {
    kpis: {
      newLeads,
      openQuoteRequests,
      openOpportunities,
      outstandingInvoices,
      openTickets,
      draftContent,
    },
    attention: { quoteRequests, tickets, overdueInvoices, dueTasks },
    recent: (recent as Array<Record<string, any>>).map((row) => ({
      id: String(row["id"]),
      module: String(row["module"]),
      action: String(row["action"]),
      tableName: (row["table_name"] as string | null) ?? null,
      recordId: (row["record_id"] as string | null) ?? null,
      createdAt: String(row["created_at"]),
    })),
  };
}

/* -------------------------------- Analytics ------------------------------- */

export async function analyticsOverview(ctx: ServiceContext, days = 30) {
  await requirePermission(ctx, "analytics.read");
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

  const { data, error } = await ctx.supabase
    .from("analytics_events")
    .select("event_name, path, created_at")
    .gte("created_at", since)
    .limit(5000);
  if (error) throw error;

  const byEvent = new Map<string, number>();
  const byPath = new Map<string, number>();
  const byDay = new Map<string, number>();

  for (const row of data ?? []) {
    byEvent.set(row.event_name, (byEvent.get(row.event_name) ?? 0) + 1);
    if (row.path) byPath.set(row.path, (byPath.get(row.path) ?? 0) + 1);
    const day = row.created_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  const sortDesc = (entries: Map<string, number>, limit: number) =>
    [...entries.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);

  return {
    days,
    total: data?.length ?? 0,
    events: sortDesc(byEvent, 12),
    paths: sortDesc(byPath, 10),
    timeline: [...byDay.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  };
}