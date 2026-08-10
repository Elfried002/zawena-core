/**
 * Logique métier Support (serveur uniquement).
 *
 * Workflow : Open → Assigned → In Progress → Waiting for Customer
 *            → Resolved → Closed (réouverture possible avec `tickets.close`).
 */
import { requirePermission } from "../core/guard.server";
import { writeAudit } from "../core/audit.server";
import { notify } from "../notifications/notifications.server";
import { runOnce } from "../core/idempotency.server";
import { enforceRateLimit, looksLikeSpam } from "../core/rate-limit.server";
import { assertTransition, ticketTransitions } from "../core/state-machines";
import { invalidState, notFound, validationError } from "../core/errors";
import { listParamsSchema, likePattern, paginate, rangeFor, type ListParams } from "../core/query";
import type { Db, ServiceContext } from "../core/context.server";
import type { CreateTicketInput, ReplyTicketInput } from "./support.schemas";

/* -------------------------------- Lectures ------------------------------- */

async function loadTicket(db: Db, ticketId: string) {
  const { data } = await db
    .from("tickets")
    .select(
      "id, number, subject, status, priority, assignee_id, requester_id, requester_email, first_response_at, category_id",
    )
    .eq("id", ticketId)
    .maybeSingle();
  if (!data) throw notFound("Ticket");
  return data;
}

export async function listTicketCategories(db: Db) {
  const { data, error } = await db
    .from("ticket_categories")
    .select("id, key, name, description, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/* ------------------------------- Création -------------------------------- */

/**
 * Création d'un ticket : numéro unique généré en base, notification support.
 * Fonctionne pour un demandeur authentifié (`ctx.userId`) ou public.
 */
export async function createTicket(
  ctx: { supabase: Db; userId: string | null },
  input: CreateTicketInput,
): Promise<{ ticketId: string; number: string; replayed: boolean }> {
  if (
    looksLikeSpam({
      honeypot: input.honeypot,
      message: input.description,
      fullName: input.subject,
    })
  ) {
    throw validationError("Demande rejetée");
  }
  const identifier = ctx.userId ?? input.requesterEmail;
  if (!identifier) throw validationError("Un email de contact est requis");
  await enforceRateLimit("ticket_create", identifier, 10, 3600);

  const run = async () => {
    const { data: number, error: numberError } = await ctx.supabase.rpc("next_document_number", {
      _key: "ticket",
    });
    if (numberError || !number) throw numberError ?? invalidState("Numérotation indisponible");

    const { data: ticket, error } = await ctx.supabase
      .from("tickets")
      .insert({
        number,
        subject: input.subject,
        description: input.description,
        category_id: input.categoryId ?? null,
        status: "open",
        priority: input.priority,
        requester_id: ctx.userId,
        requester_email: input.requesterEmail ?? null,
        company_id: input.companyId ?? null,
        contact_id: input.contactId ?? null,
      })
      .select("id, number")
      .single();
    if (error) throw error;

    await writeAudit({
      module: "support",
      action: "insert",
      tableName: "tickets",
      recordId: ticket.id,
      actorId: ctx.userId,
      after: { number: ticket.number, priority: input.priority },
    });

    await notify({
      event: "ticket_created",
      title: `Nouveau ticket ${ticket.number} : ${input.subject}`,
      body: input.description.slice(0, 400),
      entityType: "ticket",
      entityId: ticket.id,
      payload: { priority: input.priority },
    });

    return { ticketId: ticket.id, number: ticket.number };
  };

  if (!input.idempotencyKey) return { ...(await run()), replayed: false };
  const { result, replayed } = await runOnce(
    "ticket.create",
    input.idempotencyKey,
    ctx.userId,
    run,
  );
  return { ...result, replayed };
}

/* ------------------------------ Assignation ------------------------------ */

export async function assignTicket(
  ctx: ServiceContext,
  input: { ticketId: string; assigneeId: string },
): Promise<void> {
  await requirePermission(ctx, "tickets.assign");
  const ticket = await loadTicket(ctx.supabase, input.ticketId);

  if (ticket.status === "open") {
    assertTransition(ticketTransitions, "open" as never, "assigned" as never, "ticket");
  }

  const { error } = await ctx.supabase
    .from("tickets")
    .update({
      assignee_id: input.assigneeId,
      status: ticket.status === "open" ? "assigned" : (ticket.status as never),
    })
    .eq("id", ticket.id);
  if (error) throw error;

  await writeAudit({
    module: "support",
    action: "update",
    tableName: "tickets",
    recordId: ticket.id,
    actorId: ctx.userId,
    before: { assigneeId: ticket.assignee_id, status: ticket.status },
    after: { assigneeId: input.assigneeId },
  });

  if (input.assigneeId !== ctx.userId) {
    await notify({
      event: "ticket_assigned",
      title: `Ticket ${ticket.number} vous est assigné`,
      entityType: "ticket",
      entityId: ticket.id,
      userIds: [input.assigneeId],
    });
  }
}

/* -------------------------------- Statuts -------------------------------- */

/** Fermeture et réouverture réservées à la permission `tickets.close`. */
export async function changeTicketStatus(
  ctx: ServiceContext,
  input: { ticketId: string; status: string; note?: string | undefined },
): Promise<void> {
  const sensitive = input.status === "closed" || input.status === "open";
  await requirePermission(ctx, sensitive ? "tickets.close" : "tickets.update");

  const ticket = await loadTicket(ctx.supabase, input.ticketId);
  assertTransition(ticketTransitions, ticket.status as never, input.status as never, "ticket");

  const now = new Date().toISOString();
  const { error } = await ctx.supabase
    .from("tickets")
    .update({
      status: input.status as never,
      resolved_at: input.status === "resolved" ? now : null,
      closed_at: input.status === "closed" ? now : null,
    })
    .eq("id", ticket.id);
  if (error) throw error;

  if (input.note) {
    await ctx.supabase.from("ticket_replies").insert({
      ticket_id: ticket.id,
      author_id: ctx.userId,
      body: input.note,
      is_internal: true,
    });
  }

  await writeAudit({
    module: "support",
    action: sensitive ? "sensitive_change" : "update",
    tableName: "tickets",
    recordId: ticket.id,
    actorId: ctx.userId,
    before: { status: ticket.status },
    after: { status: input.status, note: input.note ?? null },
  });
}

/* -------------------------------- Réponses ------------------------------- */

/**
 * Réponse à un ticket. Un ticket fermé doit d'abord être rouvert : la
 * conversation ne peut pas contourner la machine à états.
 */
export async function replyToTicket(
  ctx: ServiceContext,
  input: ReplyTicketInput,
): Promise<{ replyId: string; replayed: boolean }> {
  await requirePermission(ctx, "ticket_replies.create");
  const ticket = await loadTicket(ctx.supabase, input.ticketId);

  if (ticket.status === "closed") {
    throw invalidState("Ticket fermé : rouvrez-le avant de répondre", { status: ticket.status });
  }

  const run = async () => {
    const body =
      input.attachmentMediaIds.length > 0
        ? `${input.body}\n\n[pièces jointes : ${input.attachmentMediaIds.join(", ")}]`
        : input.body;

    const { data: reply, error } = await ctx.supabase
      .from("ticket_replies")
      .insert({
        ticket_id: ticket.id,
        author_id: ctx.userId,
        body,
        is_internal: input.isInternal,
      })
      .select("id")
      .single();
    if (error) throw error;

    // Première réponse publique de l'équipe → SLA de première réponse.
    if (!ticket.first_response_at && !input.isInternal) {
      await ctx.supabase
        .from("tickets")
        .update({ first_response_at: new Date().toISOString() })
        .eq("id", ticket.id)
        .is("first_response_at", null);
    }

    if (!input.isInternal) {
      await notify({
        event: "ticket_replied",
        title: `Nouvelle réponse sur ${ticket.number}`,
        entityType: "ticket",
        entityId: ticket.id,
      });
    }

    await writeAudit({
      module: "support",
      action: "insert",
      tableName: "ticket_replies",
      recordId: reply.id,
      actorId: ctx.userId,
      after: { ticket: ticket.number, internal: input.isInternal },
    });

    return { replyId: reply.id };
  };

  if (!input.idempotencyKey) return { ...(await run()), replayed: false };
  const { result, replayed } = await runOnce(
    "ticket.reply",
    input.idempotencyKey,
    ctx.userId,
    run,
  );
  return { ...result, replayed };
}

/* --------------------------- Historique & listes ------------------------- */

/** Fil complet ; les notes internes sont réservées à l'équipe. */
export async function getTicket(
  ctx: ServiceContext,
  ticketId: string,
  options: { includeInternal?: boolean } = {},
) {
  await requirePermission(ctx, "tickets.read");

  const { data: ticket, error } = await ctx.supabase
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .maybeSingle();
  if (error) throw error;
  if (!ticket) throw notFound("Ticket");

  let repliesQuery = ctx.supabase
    .from("ticket_replies")
    .select("id, body, is_internal, author_id, created_at")
    .eq("ticket_id", ticketId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  if (!options.includeInternal) repliesQuery = repliesQuery.eq("is_internal", false);

  const { data: replies } = await repliesQuery;
  return { ...ticket, replies: replies ?? [] };
}

export async function listTickets(
  ctx: ServiceContext,
  params: ListParams & {
    status?: string | undefined;
    priority?: string | undefined;
    assigneeId?: string | undefined;
  },
) {
  await requirePermission(ctx, "tickets.read");
  const parsed = listParamsSchema.parse(params);
  const [start, end] = rangeFor(parsed);

  let query = ctx.supabase
    .from("tickets")
    .select(
      "id, number, subject, status, priority, assignee_id, category_id, created_at, resolved_at",
      { count: "exact" },
    )
    .is("deleted_at", null);

  if (params.status) query = query.eq("status", params.status as never);
  if (params.priority) query = query.eq("priority", params.priority as never);
  if (params.assigneeId) query = query.eq("assignee_id", params.assigneeId);
  if (parsed.from) query = query.gte("created_at", parsed.from);
  if (parsed.to) query = query.lte("created_at", parsed.to);
  if (parsed.search) {
    const pattern = likePattern(parsed.search);
    query = query.or(`number.ilike.${pattern},subject.ilike.${pattern}`);
  }

  const { data, count, error } = await query
    .order(parsed.sortBy ?? "created_at", { ascending: parsed.sortDir === "asc" })
    .range(start, end);
  if (error) throw error;
  return paginate(data ?? [], count ?? 0, parsed);
}

export async function openTicketsOverview(ctx: ServiceContext) {
  await requirePermission(ctx, "tickets.read");
  const { data, error } = await ctx.supabase.from("v_open_tickets").select("*");
  if (error) throw error;
  return data ?? [];
}