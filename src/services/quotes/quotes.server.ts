/**
 * Logique métier Devis (serveur uniquement).
 *
 * Workflow complet :
 *   Demande → Review → Qualification → Création du devis
 *   → Draft → Sent → Viewed → Accepted / Rejected / Expired / Cancelled
 *
 * Règle centrale : un devis figé (envoyé ou au-delà) n'est JAMAIS modifiable
 * silencieusement. Toute modification passe par une révision versionnée.
 */
import { requirePermission } from "../core/guard.server";
import { assertLockVersion } from "../core/guard.server";
import { writeAudit } from "../core/audit.server";
import { notify } from "../notifications/notifications.server";
import { runOnce } from "../core/idempotency.server";
import { enforceRateLimit, looksLikeSpam } from "../core/rate-limit.server";
import { logActivity, createOrEnrichLead } from "../crm/crm.server";
import {
  assertTransition,
  quoteRequestTransitions,
  quoteTransitions,
  QUOTE_IMMUTABLE_STATUSES,
  type QuoteStatus,
} from "../core/state-machines";
import { invalidState, notFound, validationError } from "../core/errors";
import { listParamsSchema, likePattern, paginate, rangeFor, type ListParams } from "../core/query";
import { lineTotal, round2, toMinorUnits, fromMinorUnits, type Currency } from "../core/money";
import type { Db, ServiceContext } from "../core/context.server";
import type {
  CreateQuoteInput,
  QuoteItemInput,
  QuoteRequestInput,
  UpdateQuoteDraftInput,
} from "./quotes.schemas";

/* ------------------------- Calculs (sans flottants) ----------------------- */

export interface QuoteTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

/**
 * Totaux calculés en **unités mineures entières** puis restitués en décimal.
 * Même formule que les triggers PostgreSQL : la base reste l'autorité, ce
 * calcul sert à valider et à prévisualiser avant écriture.
 */
export function computeQuoteTotals(
  items: QuoteItemInput[],
  options: { currency: Currency; discountAmount: number; taxRate: number },
): QuoteTotals {
  const { currency, discountAmount, taxRate } = options;
  let subtotalMinor = 0;
  for (const item of items) {
    subtotalMinor += toMinorUnits(
      lineTotal(item.quantity, item.unitPrice, item.discountPercent),
      currency,
    );
  }
  const discountMinor = Math.min(toMinorUnits(discountAmount, currency), subtotalMinor);
  const baseMinor = subtotalMinor - discountMinor;
  const taxMinor = Math.round((baseMinor * taxRate) / 100);

  return {
    subtotal: fromMinorUnits(subtotalMinor, currency),
    discountAmount: fromMinorUnits(discountMinor, currency),
    taxAmount: fromMinorUnits(taxMinor, currency),
    total: fromMinorUnits(baseMinor + taxMinor, currency),
  };
}

function assertItemsValid(items: QuoteItemInput[]): void {
  if (items.length === 0) throw validationError("Un devis doit contenir au moins une ligne");
  for (const item of items) {
    if (round2(item.quantity * item.unitPrice) <= 0 && item.unitPrice < 0) {
      throw validationError("Ligne de devis invalide", { description: item.description });
    }
  }
}

/* ---------------------- 1. Demande de devis (public) ---------------------- */

/**
 * Point d'entrée public : crée la demande ET le prospect associé.
 * Aucune permission requise, mais rate limiting + anti-spam obligatoires.
 */
export async function submitQuoteRequest(
  db: Db,
  input: QuoteRequestInput,
  meta: { ipHash?: string | undefined } = {},
): Promise<{ requestId: string; leadId: string }> {
  if (looksLikeSpam({ honeypot: input.honeypot, message: input.description, fullName: input.fullName })) {
    throw validationError("Demande rejetée");
  }
  await enforceRateLimit("quote_request", meta.ipHash ?? input.email, 5, 3600);

  const { leadId } = await createOrEnrichLead(
    db,
    {
      fullName: input.fullName,
      email: input.email,
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.companyName ? { companyName: input.companyName } : {}),
      message: input.description,
      ...(input.serviceId ? { serviceId: input.serviceId } : {}),
      source: "website",
      utm: input.utm,
    },
    null,
  );

  const { data, error } = await db
    .from("quote_requests")
    .insert({
      full_name: input.fullName,
      email: input.email,
      phone: input.phone ?? null,
      company_name: input.companyName ?? null,
      service_id: input.serviceId ?? null,
      budget_range: input.budgetRange ?? null,
      timeline: input.timeline ?? null,
      description: input.description,
      status: "new",
      lead_id: leadId,
    })
    .select("id")
    .single();
  if (error) throw error;

  await writeAudit({
    module: "quotes",
    action: "insert",
    tableName: "quote_requests",
    recordId: data.id,
    actorId: null,
    after: { source: "website" },
  });

  await notify({
    event: "quote_request_created",
    title: `Nouvelle demande de devis : ${input.fullName}`,
    body: input.description.slice(0, 400),
    entityType: "quote_request",
    entityId: data.id,
  });

  return { requestId: data.id, leadId };
}

/* ------------------- 2. Review & qualification (staff) ------------------- */

export async function reviewQuoteRequest(
  ctx: ServiceContext,
  input: { requestId: string; status: string; note?: string | undefined },
): Promise<void> {
  await requirePermission(ctx, "quote_requests.update");

  const { data: request } = await ctx.supabase
    .from("quote_requests")
    .select("id, status, full_name")
    .eq("id", input.requestId)
    .maybeSingle();
  if (!request) throw notFound("Demande de devis");

  assertTransition(
    quoteRequestTransitions,
    request.status as never,
    input.status as never,
    "demande de devis",
  );

  const { error } = await ctx.supabase
    .from("quote_requests")
    .update({ status: input.status as never, owner_id: ctx.userId })
    .eq("id", input.requestId);
  if (error) throw error;

  await writeAudit({
    module: "quotes",
    action: "update",
    tableName: "quote_requests",
    recordId: input.requestId,
    actorId: ctx.userId,
    before: { status: request.status },
    after: { status: input.status, note: input.note ?? null },
  });
}

export async function listQuoteRequests(
  ctx: ServiceContext,
  params: ListParams & { status?: string | undefined },
) {
  await requirePermission(ctx, "quote_requests.read");
  const parsed = listParamsSchema.parse(params);
  const [start, end] = rangeFor(parsed);

  let query = ctx.supabase
    .from("quote_requests")
    .select(
      "id, full_name, email, company_name, service_id, budget_range, timeline, status, created_at",
      { count: "exact" },
    )
    .is("deleted_at", null);

  if (params.status) query = query.eq("status", params.status as never);
  if (parsed.from) query = query.gte("created_at", parsed.from);
  if (parsed.to) query = query.lte("created_at", parsed.to);
  if (parsed.search) {
    const pattern = likePattern(parsed.search);
    query = query.or(
      `full_name.ilike.${pattern},email.ilike.${pattern},company_name.ilike.${pattern}`,
    );
  }

  const { data, count, error } = await query
    .order(parsed.sortBy ?? "created_at", { ascending: parsed.sortDir === "asc" })
    .range(start, end);
  if (error) throw error;
  return paginate(data ?? [], count ?? 0, parsed);
}

/* ------------------------ 3. Création du devis --------------------------- */

async function insertQuoteItems(
  db: Db,
  quoteId: string,
  items: QuoteItemInput[],
): Promise<void> {
  const { error } = await db.from("quote_items").insert(
    items.map((item, index) => ({
      quote_id: quoteId,
      service_id: item.serviceId ?? null,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      discount_percent: item.discountPercent,
      sort_order: index,
    })),
  );
  if (error) throw error;
}

/**
 * Crée un devis en brouillon avec un numéro unique généré en base.
 * Idempotent si `idempotencyKey` est fourni (double-clic, retry réseau).
 */
export async function createQuote(
  ctx: ServiceContext,
  input: CreateQuoteInput,
): Promise<{ quoteId: string; number: string; totals: QuoteTotals; replayed: boolean }> {
  await requirePermission(ctx, "quotes.create");
  assertItemsValid(input.items);

  const run = async () => {
    const totals = computeQuoteTotals(input.items, {
      currency: input.currency,
      discountAmount: input.discountAmount,
      taxRate: input.taxRate,
    });

    const { data: number, error: numberError } = await ctx.supabase.rpc("next_document_number", {
      _key: "quote",
    });
    if (numberError || !number) throw numberError ?? invalidState("Numérotation indisponible");

    const { data: quote, error } = await ctx.supabase
      .from("quotes")
      .insert({
        number,
        title: input.title,
        quote_request_id: input.quoteRequestId ?? null,
        opportunity_id: input.opportunityId ?? null,
        company_id: input.companyId ?? null,
        contact_id: input.contactId ?? null,
        status: "draft",
        currency: input.currency,
        discount_amount: totals.discountAmount,
        tax_rate: input.taxRate,
        valid_until: input.validUntil ?? null,
        terms: input.terms ?? null,
        notes: input.notes ?? null,
        owner_id: ctx.userId,
        version: 1,
      })
      .select("id, number")
      .single();
    if (error) throw error;

    await insertQuoteItems(ctx.supabase, quote.id, input.items);

    if (input.quoteRequestId) {
      const { data: request } = await ctx.supabase
        .from("quote_requests")
        .select("status")
        .eq("id", input.quoteRequestId)
        .maybeSingle();
      if (request && request.status !== "quote_created") {
        assertTransition(
          quoteRequestTransitions,
          request.status as never,
          "quote_created" as never,
          "demande de devis",
        );
        await ctx.supabase
          .from("quote_requests")
          .update({ status: "quote_created" })
          .eq("id", input.quoteRequestId);
      }
    }

    await writeAudit({
      module: "quotes",
      action: "insert",
      tableName: "quotes",
      recordId: quote.id,
      actorId: ctx.userId,
      after: { number: quote.number, total: totals.total, items: input.items.length },
    });

    return { quoteId: quote.id, number: quote.number, totals };
  };

  if (!input.idempotencyKey) {
    return { ...(await run()), replayed: false };
  }
  const { result, replayed } = await runOnce(
    "quote.create",
    input.idempotencyKey,
    ctx.userId,
    run,
  );
  return { ...result, replayed };
}

/* ----------------------------- 4. Brouillon ------------------------------ */

async function loadQuote(db: Db, quoteId: string) {
  const { data } = await db
    .from("quotes")
    .select(
      "id, number, status, currency, version, revision_of, lock_version, tax_rate, discount_amount, total, valid_until, opportunity_id, company_id, contact_id, quote_request_id, title, terms, notes, owner_id",
    )
    .eq("id", quoteId)
    .maybeSingle();
  if (!data) throw notFound("Devis");
  return data;
}

/** Modification autorisée uniquement en brouillon (sinon : révision). */
export async function updateQuoteDraft(
  ctx: ServiceContext,
  input: UpdateQuoteDraftInput,
): Promise<{ totals: QuoteTotals | null }> {
  await requirePermission(ctx, "quotes.update");
  const quote = await loadQuote(ctx.supabase, input.quoteId);

  if (QUOTE_IMMUTABLE_STATUSES.includes(quote.status as QuoteStatus)) {
    throw invalidState(
      `Le devis ${quote.number} est figé (${quote.status}) : créez une révision pour le modifier`,
      { status: quote.status },
    );
  }
  await assertLockVersion(ctx.supabase, "quotes", quote.id, input.lockVersion);

  const taxRate = input.taxRate ?? Number(quote.tax_rate);
  const discountAmount = input.discountAmount ?? Number(quote.discount_amount);

  let totals: QuoteTotals | null = null;
  if (input.items) {
    assertItemsValid(input.items);
    totals = computeQuoteTotals(input.items, {
      currency: quote.currency as Currency,
      discountAmount,
      taxRate,
    });
    const { error: deleteError } = await ctx.supabase
      .from("quote_items")
      .delete()
      .eq("quote_id", quote.id);
    if (deleteError) throw deleteError;
    await insertQuoteItems(ctx.supabase, quote.id, input.items);
  }

  const { error } = await ctx.supabase
    .from("quotes")
    .update({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.terms !== undefined ? { terms: input.terms } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.validUntil !== undefined ? { valid_until: input.validUntil } : {}),
      tax_rate: taxRate,
      discount_amount: discountAmount,
    })
    .eq("id", quote.id)
    .eq("lock_version", input.lockVersion);
  if (error) throw error;

  await writeAudit({
    module: "quotes",
    action: "update",
    tableName: "quotes",
    recordId: quote.id,
    actorId: ctx.userId,
    before: { taxRate: quote.tax_rate, discountAmount: quote.discount_amount },
    after: { taxRate, discountAmount, itemsReplaced: Boolean(input.items) },
  });

  return { totals };
}

/**
 * Révision : un devis figé est cloné en nouveau brouillon (version + 1).
 * L'original reste intact pour l'historique et la piste d'audit.
 */
export async function reviseQuote(
  ctx: ServiceContext,
  input: { quoteId: string },
): Promise<{ quoteId: string; number: string; version: number }> {
  await requirePermission(ctx, "quotes.update");
  const source = await loadQuote(ctx.supabase, input.quoteId);

  const { data: items, error: itemsError } = await ctx.supabase
    .from("quote_items")
    .select("service_id, description, quantity, unit_price, discount_percent, sort_order")
    .eq("quote_id", source.id)
    .order("sort_order", { ascending: true });
  if (itemsError) throw itemsError;

  const { data: number, error: numberError } = await ctx.supabase.rpc("next_document_number", {
    _key: "quote",
  });
  if (numberError || !number) throw numberError ?? invalidState("Numérotation indisponible");

  const { data: revision, error } = await ctx.supabase
    .from("quotes")
    .insert({
      number,
      title: source.title,
      quote_request_id: source.quote_request_id,
      opportunity_id: source.opportunity_id,
      company_id: source.company_id,
      contact_id: source.contact_id,
      status: "draft",
      currency: source.currency,
      discount_amount: source.discount_amount,
      tax_rate: source.tax_rate,
      valid_until: source.valid_until,
      terms: source.terms,
      notes: source.notes,
      owner_id: ctx.userId,
      version: (source.version ?? 1) + 1,
      revision_of: source.id,
    })
    .select("id, number, version")
    .single();
  if (error) throw error;

  if (items && items.length > 0) {
    const { error: copyError } = await ctx.supabase.from("quote_items").insert(
      items.map((item, index) => ({
        quote_id: revision.id,
        service_id: item.service_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        sort_order: item.sort_order ?? index,
      })),
    );
    if (copyError) throw copyError;
  }

  await writeAudit({
    module: "quotes",
    action: "sensitive_change",
    tableName: "quotes",
    recordId: revision.id,
    actorId: ctx.userId,
    before: { quoteId: source.id, number: source.number, version: source.version },
    after: { quoteId: revision.id, number: revision.number, version: revision.version },
  });

  return { quoteId: revision.id, number: revision.number, version: revision.version };
}

/* ------------------------------- 5. Envoi -------------------------------- */

export async function sendQuote(
  ctx: ServiceContext,
  input: { quoteId: string; lockVersion: number; idempotencyKey?: string | undefined },
): Promise<{ sentAt: string; replayed: boolean }> {
  await requirePermission(ctx, "quotes.send");
  const quote = await loadQuote(ctx.supabase, input.quoteId);

  assertTransition(quoteTransitions, quote.status as never, "sent" as never, "devis");
  await assertLockVersion(ctx.supabase, "quotes", quote.id, input.lockVersion);

  const { count } = await ctx.supabase
    .from("quote_items")
    .select("id", { count: "exact", head: true })
    .eq("quote_id", quote.id);
  if (!count) throw validationError("Impossible d'envoyer un devis sans ligne");

  const run = async () => {
    const sentAt = new Date().toISOString();
    const { error } = await ctx.supabase
      .from("quotes")
      .update({ status: "sent", sent_at: sentAt })
      .eq("id", quote.id)
      .eq("lock_version", input.lockVersion);
    if (error) throw error;

    await writeAudit({
      module: "quotes",
      action: "sensitive_change",
      tableName: "quotes",
      recordId: quote.id,
      actorId: ctx.userId,
      before: { status: quote.status },
      after: { status: "sent", sentAt },
    });

    await notify({
      event: "quote_sent",
      title: `Devis ${quote.number} envoyé`,
      entityType: "quote",
      entityId: quote.id,
    });

    return { sentAt };
  };

  if (!input.idempotencyKey) return { ...(await run()), replayed: false };
  const { result, replayed } = await runOnce("quote.send", input.idempotencyKey, ctx.userId, run);
  return { ...result, replayed };
}

/** Consultation par le destinataire : `sent → viewed` une seule fois. */
export async function markQuoteViewed(db: Db, quoteId: string): Promise<void> {
  const quote = await loadQuote(db, quoteId);
  if (quote.status !== "sent") return;

  await db
    .from("quotes")
    .update({ status: "viewed", viewed_at: new Date().toISOString() })
    .eq("id", quoteId)
    .eq("status", "sent");

  await writeAudit({
    module: "quotes",
    action: "update",
    tableName: "quotes",
    recordId: quoteId,
    actorId: null,
    after: { status: "viewed" },
  });
}

/* --------------------- 6. Décision & expiration -------------------------- */

export async function decideQuote(
  ctx: ServiceContext,
  input: {
    quoteId: string;
    decision: "accepted" | "rejected" | "cancelled";
    reason?: string | undefined;
    lockVersion?: number | undefined;
  },
): Promise<void> {
  await requirePermission(ctx, "quotes.update");
  const quote = await loadQuote(ctx.supabase, input.quoteId);

  assertTransition(quoteTransitions, quote.status as never, input.decision as never, "devis");
  await assertLockVersion(ctx.supabase, "quotes", quote.id, input.lockVersion);

  const now = new Date().toISOString();
  const { error } = await ctx.supabase
    .from("quotes")
    .update({
      status: input.decision,
      accepted_at: input.decision === "accepted" ? now : null,
      rejected_at: input.decision === "rejected" ? now : null,
      decision_reason: input.reason ?? null,
    })
    .eq("id", quote.id);
  if (error) throw error;

  if (quote.opportunity_id) {
    await logActivity(ctx, {
      entityType: "quote",
      entityId: quote.id,
      type: "note",
      subject: `Devis ${quote.number} : ${input.decision}`,
      ...(input.reason ? { body: input.reason } : {}),
    });
  }

  await writeAudit({
    module: "quotes",
    action: "sensitive_change",
    tableName: "quotes",
    recordId: quote.id,
    actorId: ctx.userId,
    before: { status: quote.status },
    after: { status: input.decision, reason: input.reason ?? null },
  });

  if (input.decision === "accepted") {
    await notify({
      event: "quote_accepted",
      title: `Devis ${quote.number} accepté`,
      entityType: "quote",
      entityId: quote.id,
      payload: { total: quote.total },
    });
  }
}

/**
 * Expiration automatique : tâche de maintenance idempotente par nature
 * (seuls les devis dont `valid_until` est dépassée sont touchés).
 */
export async function expireOverdueQuotes(ctx: ServiceContext): Promise<{ expired: number }> {
  await requirePermission(ctx, "quotes.update");
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await ctx.supabase
    .from("quotes")
    .update({ status: "expired", expired_at: new Date().toISOString() })
    .in("status", ["sent", "viewed"])
    .not("valid_until", "is", null)
    .lt("valid_until", today)
    .select("id, number");
  if (error) throw error;

  for (const quote of data ?? []) {
    await writeAudit({
      module: "quotes",
      action: "update",
      tableName: "quotes",
      recordId: quote.id,
      actorId: ctx.userId,
      after: { status: "expired" },
    });
  }
  return { expired: (data ?? []).length };
}

/* ------------------------- Lectures & historique ------------------------- */

export async function getQuote(ctx: ServiceContext, quoteId: string) {
  await requirePermission(ctx, "quotes.read");
  const { data, error } = await ctx.supabase
    .from("quotes")
    .select("*, quote_items(*)")
    .eq("id", quoteId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFound("Devis");
  return data;
}

/** Chaîne de révisions d'un devis, de la version initiale à la plus récente. */
export async function getQuoteHistory(ctx: ServiceContext, quoteId: string) {
  await requirePermission(ctx, "quotes.read");
  const chain: Array<{ id: string; number: string; version: number; status: string }> = [];

  let cursor: string | null = quoteId;
  while (cursor) {
    const { data } = (await ctx.supabase
      .from("quotes")
      .select("id, number, version, status, revision_of")
      .eq("id", cursor)
      .maybeSingle()) as {
      data: {
        id: string;
        number: string;
        version: number;
        status: string;
        revision_of: string | null;
      } | null;
    };
    if (!data) break;
    chain.unshift({
      id: data.id,
      number: data.number,
      version: data.version,
      status: data.status as string,
    });
    cursor = data.revision_of;
  }

  const { data: descendants } = await ctx.supabase
    .from("quotes")
    .select("id, number, version, status")
    .eq("revision_of", quoteId)
    .order("version", { ascending: true });
  for (const row of descendants ?? []) {
    chain.push({
      id: row.id,
      number: row.number,
      version: row.version,
      status: row.status as string,
    });
  }

  return chain;
}

export async function listQuotes(
  ctx: ServiceContext,
  params: ListParams & { status?: string | undefined; companyId?: string | undefined },
) {
  await requirePermission(ctx, "quotes.read");
  const parsed = listParamsSchema.parse(params);
  const [start, end] = rangeFor(parsed);

  let query = ctx.supabase
    .from("quotes")
    .select(
      "id, number, title, status, currency, total, version, valid_until, sent_at, created_at, company_id",
      { count: "exact" },
    )
    .is("deleted_at", null);

  if (params.status) query = query.eq("status", params.status as never);
  if (params.companyId) query = query.eq("company_id", params.companyId);
  if (parsed.from) query = query.gte("created_at", parsed.from);
  if (parsed.to) query = query.lte("created_at", parsed.to);
  if (parsed.search) {
    const pattern = likePattern(parsed.search);
    query = query.or(`number.ilike.${pattern},title.ilike.${pattern}`);
  }

  const { data, count, error } = await query
    .order(parsed.sortBy ?? "created_at", { ascending: parsed.sortDir === "asc" })
    .range(start, end);
  if (error) throw error;
  return paginate(data ?? [], count ?? 0, parsed);
}