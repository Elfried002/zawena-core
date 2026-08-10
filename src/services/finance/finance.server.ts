/**
 * Logique métier Finance (serveur uniquement) — MVP.
 *
 * Statuts : draft → issued → sent → partially_paid / paid / overdue / cancelled
 * Relations : devis accepté → facture → paiements.
 *
 * V1 : aucune passerelle de paiement. Les paiements sont *enregistrés* et
 * suivis ; `payment_method` + `reference` suffisent à accueillir plus tard un
 * fournisseur (Stripe, Paddle, mobile money) sans modifier le modèle.
 */
import { requirePermission, assertLockVersion } from "../core/guard.server";
import { writeAudit } from "../core/audit.server";
import { notify } from "../notifications/notifications.server";
import { runOnce } from "../core/idempotency.server";
import { assertTransition, invoiceTransitions } from "../core/state-machines";
import { invalidState, notFound, validationError } from "../core/errors";
import { listParamsSchema, likePattern, paginate, rangeFor, type ListParams } from "../core/query";
import { fromMinorUnits, toMinorUnits, type Currency } from "../core/money";
import type { Db, ServiceContext } from "../core/context.server";
import type { CreateInvoiceInput, InvoiceItemInput, RecordPaymentInput } from "./finance.schemas";

/* ------------------------- Calculs (unités mineures) ---------------------- */

export interface InvoiceTotals {
  subtotal: number;
  taxAmount: number;
  total: number;
}

export function computeInvoiceTotals(
  items: InvoiceItemInput[],
  options: { currency: Currency; taxRate: number },
): InvoiceTotals {
  let subtotalMinor = 0;
  for (const item of items) {
    subtotalMinor += toMinorUnits(item.quantity * item.unitPrice, options.currency);
  }
  const taxMinor = Math.round((subtotalMinor * options.taxRate) / 100);
  return {
    subtotal: fromMinorUnits(subtotalMinor, options.currency),
    taxAmount: fromMinorUnits(taxMinor, options.currency),
    total: fromMinorUnits(subtotalMinor + taxMinor, options.currency),
  };
}

/** Reste à payer, calculé en unités mineures pour éviter tout écart de centime. */
export function balanceDue(
  total: number,
  amountPaid: number,
  currency: Currency,
): number {
  const due = toMinorUnits(total, currency) - toMinorUnits(amountPaid, currency);
  return fromMinorUnits(Math.max(due, 0), currency);
}

/* ------------------------------- Factures -------------------------------- */

async function loadInvoice(db: Db, invoiceId: string) {
  const { data } = await db
    .from("invoices")
    .select(
      "id, number, status, currency, total, amount_paid, tax_rate, lock_version, quote_id, company_id, contact_id, due_date",
    )
    .eq("id", invoiceId)
    .maybeSingle();
  if (!data) throw notFound("Facture");
  return data;
}

async function insertInvoiceItems(
  db: Db,
  invoiceId: string,
  items: InvoiceItemInput[],
): Promise<void> {
  const { error } = await db.from("invoice_items").insert(
    items.map((item, index) => ({
      invoice_id: invoiceId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      sort_order: index,
    })),
  );
  if (error) throw error;
}

export async function createInvoice(
  ctx: ServiceContext,
  input: CreateInvoiceInput,
): Promise<{ invoiceId: string; number: string; totals: InvoiceTotals; replayed: boolean }> {
  await requirePermission(ctx, "invoices.create");
  if (input.items.length === 0) throw validationError("Une facture doit contenir au moins une ligne");

  const run = async () => {
    const totals = computeInvoiceTotals(input.items, {
      currency: input.currency,
      taxRate: input.taxRate,
    });

    const { data: number, error: numberError } = await ctx.supabase.rpc("next_document_number", {
      _key: "invoice",
    });
    if (numberError || !number) throw numberError ?? invalidState("Numérotation indisponible");

    const { data: invoice, error } = await ctx.supabase
      .from("invoices")
      .insert({
        number,
        quote_id: input.quoteId ?? null,
        company_id: input.companyId ?? null,
        contact_id: input.contactId ?? null,
        status: "draft",
        currency: input.currency,
        tax_rate: input.taxRate,
        issue_date: input.issueDate ?? new Date().toISOString().slice(0, 10),
        due_date: input.dueDate ?? null,
        notes: input.notes ?? null,
        owner_id: ctx.userId,
      })
      .select("id, number")
      .single();
    if (error) throw error;

    await insertInvoiceItems(ctx.supabase, invoice.id, input.items);

    await writeAudit({
      module: "finance",
      action: "insert",
      tableName: "invoices",
      recordId: invoice.id,
      actorId: ctx.userId,
      after: { number: invoice.number, total: totals.total },
    });

    return { invoiceId: invoice.id, number: invoice.number, totals };
  };

  if (!input.idempotencyKey) return { ...(await run()), replayed: false };
  const { result, replayed } = await runOnce(
    "invoice.create",
    input.idempotencyKey,
    ctx.userId,
    run,
  );
  return { ...result, replayed };
}

/**
 * Facturation d'un devis accepté : relation devis → facture.
 * Un devis ne peut être facturé qu'une seule fois (contrôle explicite).
 */
export async function createInvoiceFromQuote(
  ctx: ServiceContext,
  input: { quoteId: string; dueInDays: number; idempotencyKey?: string | undefined },
): Promise<{ invoiceId: string; number: string; replayed: boolean }> {
  await requirePermission(ctx, "invoices.create");

  const { data: quote } = await ctx.supabase
    .from("quotes")
    .select("id, number, status, currency, tax_rate, company_id, contact_id, discount_amount")
    .eq("id", input.quoteId)
    .maybeSingle();
  if (!quote) throw notFound("Devis");
  if (quote.status !== "accepted") {
    throw invalidState("Seul un devis accepté peut être facturé", { status: quote.status });
  }

  const { data: existing } = await ctx.supabase
    .from("invoices")
    .select("id, number")
    .eq("quote_id", quote.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (existing) {
    return { invoiceId: existing.id, number: existing.number, replayed: true };
  }

  const { data: items, error: itemsError } = await ctx.supabase
    .from("quote_items")
    .select("description, quantity, unit_price, discount_percent, sort_order")
    .eq("quote_id", quote.id)
    .order("sort_order", { ascending: true });
  if (itemsError) throw itemsError;
  if (!items || items.length === 0) throw validationError("Le devis ne contient aucune ligne");

  const currency = quote.currency as Currency;
  const dueDate = new Date(Date.now() + input.dueInDays * 86_400_000).toISOString().slice(0, 10);

  const created = await createInvoice(ctx, {
    ...(quote.company_id ? { companyId: quote.company_id } : {}),
    ...(quote.contact_id ? { contactId: quote.contact_id } : {}),
    quoteId: quote.id,
    currency,
    taxRate: Number(quote.tax_rate),
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate,
    notes: `Facture issue du devis ${quote.number}`,
    items: items.map((item) => ({
      description: item.description,
      quantity: Number(item.quantity),
      // La remise de ligne est intégrée au prix unitaire facturé.
      unitPrice: Number(item.unit_price) * (1 - Number(item.discount_percent ?? 0) / 100),
    })),
    ...(input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : {}),
  });

  await writeAudit({
    module: "finance",
    action: "sensitive_change",
    tableName: "invoices",
    recordId: created.invoiceId,
    actorId: ctx.userId,
    after: { fromQuote: quote.number, number: created.number },
  });

  return { invoiceId: created.invoiceId, number: created.number, replayed: created.replayed };
}

/** Modification de lignes possible uniquement tant que la facture est en brouillon. */
export async function updateInvoiceDraft(
  ctx: ServiceContext,
  input: {
    invoiceId: string;
    lockVersion: number;
    taxRate?: number | undefined;
    dueDate?: string | undefined;
    notes?: string | undefined;
    items?: InvoiceItemInput[] | undefined;
  },
): Promise<void> {
  await requirePermission(ctx, "invoices.update");
  const invoice = await loadInvoice(ctx.supabase, input.invoiceId);
  if (invoice.status !== "draft") {
    throw invalidState("Une facture émise ne peut plus être modifiée", { status: invoice.status });
  }
  await assertLockVersion(ctx.supabase, "invoices", invoice.id, input.lockVersion);

  if (input.items) {
    if (input.items.length === 0) throw validationError("Au moins une ligne est requise");
    const { error: deleteError } = await ctx.supabase
      .from("invoice_items")
      .delete()
      .eq("invoice_id", invoice.id);
    if (deleteError) throw deleteError;
    await insertInvoiceItems(ctx.supabase, invoice.id, input.items);
  }

  const { error } = await ctx.supabase
    .from("invoices")
    .update({
      ...(input.taxRate !== undefined ? { tax_rate: input.taxRate } : {}),
      ...(input.dueDate !== undefined ? { due_date: input.dueDate } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    })
    .eq("id", invoice.id)
    .eq("lock_version", input.lockVersion);
  if (error) throw error;

  await writeAudit({
    module: "finance",
    action: "update",
    tableName: "invoices",
    recordId: invoice.id,
    actorId: ctx.userId,
    after: { itemsReplaced: Boolean(input.items) },
  });
}

/** Transition de statut contrôlée par la machine à états financière. */
export async function changeInvoiceStatus(
  ctx: ServiceContext,
  input: { invoiceId: string; status: string; lockVersion?: number | undefined },
): Promise<void> {
  await requirePermission(ctx, input.status === "sent" ? "invoices.send" : "invoices.update");
  const invoice = await loadInvoice(ctx.supabase, input.invoiceId);

  assertTransition(invoiceTransitions, invoice.status as never, input.status as never, "facture");
  await assertLockVersion(ctx.supabase, "invoices", invoice.id, input.lockVersion);

  if (input.status === "issued") {
    const { count } = await ctx.supabase
      .from("invoice_items")
      .select("id", { count: "exact", head: true })
      .eq("invoice_id", invoice.id);
    if (!count) throw validationError("Impossible d'émettre une facture sans ligne");
  }

  const { error } = await ctx.supabase
    .from("invoices")
    .update({ status: input.status as never })
    .eq("id", invoice.id);
  if (error) throw error;

  await writeAudit({
    module: "finance",
    action: "sensitive_change",
    tableName: "invoices",
    recordId: invoice.id,
    actorId: ctx.userId,
    before: { status: invoice.status },
    after: { status: input.status },
  });

  if (input.status === "sent") {
    await notify({
      event: "invoice_sent",
      title: `Facture ${invoice.number} envoyée`,
      entityType: "invoice",
      entityId: invoice.id,
    });
  }
}

/** Marque en retard les factures échues et non soldées (tâche périodique). */
export async function markOverdueInvoices(ctx: ServiceContext): Promise<{ overdue: number }> {
  await requirePermission(ctx, "invoices.update");
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await ctx.supabase
    .from("invoices")
    .update({ status: "overdue" })
    .in("status", ["sent", "partially_paid"])
    .not("due_date", "is", null)
    .lt("due_date", today)
    .select("id");
  if (error) throw error;
  return { overdue: (data ?? []).length };
}

/* ------------------------------- Paiements -------------------------------- */

/**
 * Enregistrement d'un paiement.
 * Les totaux et le statut de la facture sont recalculés par le trigger
 * `apply_payment_to_invoice` : aucune duplication de la règle côté service.
 */
export async function recordPayment(
  ctx: ServiceContext,
  input: RecordPaymentInput,
): Promise<{ paymentId: string; balanceDue: number; replayed: boolean }> {
  await requirePermission(ctx, "payments.create");
  const invoice = await loadInvoice(ctx.supabase, input.invoiceId);

  if (["draft", "cancelled", "void"].includes(invoice.status as string)) {
    throw invalidState("Aucun paiement possible sur cette facture", { status: invoice.status });
  }

  const currency = invoice.currency as Currency;
  const remaining = balanceDue(Number(invoice.total), Number(invoice.amount_paid), currency);
  if (toMinorUnits(input.amount, currency) > toMinorUnits(remaining, currency)) {
    throw validationError("Le montant dépasse le solde restant dû", { remaining });
  }

  const run = async () => {
    const { data: payment, error } = await ctx.supabase
      .from("payments")
      .insert({
        invoice_id: invoice.id,
        amount: input.amount,
        currency,
        method: input.method,
        reference: input.reference ?? null,
        paid_at: input.paidAt ?? new Date().toISOString(),
        notes: input.notes ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;

    await writeAudit({
      module: "finance",
      action: "sensitive_change",
      tableName: "payments",
      recordId: payment.id,
      actorId: ctx.userId,
      after: { invoice: invoice.number, amount: input.amount, method: input.method },
    });

    await notify({
      event: "payment_recorded",
      title: `Paiement enregistré sur ${invoice.number}`,
      entityType: "invoice",
      entityId: invoice.id,
      payload: { amount: input.amount, method: input.method },
    });

    const refreshed = await loadInvoice(ctx.supabase, invoice.id);
    return {
      paymentId: payment.id,
      balanceDue: balanceDue(Number(refreshed.total), Number(refreshed.amount_paid), currency),
    };
  };

  if (!input.idempotencyKey) return { ...(await run()), replayed: false };
  const { result, replayed } = await runOnce(
    "payment.record",
    input.idempotencyKey,
    ctx.userId,
    run,
  );
  return { ...result, replayed };
}

export async function listPayments(ctx: ServiceContext, invoiceId: string) {
  await requirePermission(ctx, "payments.read");
  const { data, error } = await ctx.supabase
    .from("payments")
    .select("id, amount, currency, method, reference, paid_at, notes, created_at")
    .eq("invoice_id", invoiceId)
    .order("paid_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/* ------------------------------- Lectures -------------------------------- */

export async function getInvoice(ctx: ServiceContext, invoiceId: string) {
  await requirePermission(ctx, "invoices.read");
  const { data, error } = await ctx.supabase
    .from("invoices")
    .select("*, invoice_items(*), payments(*)")
    .eq("id", invoiceId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFound("Facture");
  return {
    ...data,
    balance_due: balanceDue(
      Number(data.total),
      Number(data.amount_paid),
      data.currency as Currency,
    ),
  };
}

export async function listInvoices(
  ctx: ServiceContext,
  params: ListParams & { status?: string | undefined; companyId?: string | undefined },
) {
  await requirePermission(ctx, "invoices.read");
  const parsed = listParamsSchema.parse(params);
  const [start, end] = rangeFor(parsed);

  let query = ctx.supabase
    .from("invoices")
    .select(
      "id, number, status, currency, total, amount_paid, issue_date, due_date, company_id, quote_id, created_at",
      { count: "exact" },
    )
    .is("deleted_at", null);

  if (params.status) query = query.eq("status", params.status as never);
  if (params.companyId) query = query.eq("company_id", params.companyId);
  if (parsed.from) query = query.gte("created_at", parsed.from);
  if (parsed.to) query = query.lte("created_at", parsed.to);
  if (parsed.search) query = query.ilike("number", likePattern(parsed.search));

  const { data, count, error } = await query
    .order(parsed.sortBy ?? "created_at", { ascending: parsed.sortDir === "asc" })
    .range(start, end);
  if (error) throw error;

  const items = (data ?? []).map((row) => ({
    ...row,
    balance_due: balanceDue(
      Number(row.total),
      Number(row.amount_paid),
      row.currency as Currency,
    ),
  }));
  return paginate(items, count ?? 0, parsed);
}

export async function outstandingInvoices(ctx: ServiceContext) {
  await requirePermission(ctx, "invoices.read");
  const { data, error } = await ctx.supabase.from("v_outstanding_invoices").select("*");
  if (error) throw error;
  return data ?? [];
}