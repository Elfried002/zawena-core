/**
 * Logique métier CRM (serveur uniquement).
 * Prospects → Contacts/Entreprises → Opportunités, avec activités et tâches.
 */
import { requirePermission } from "../core/guard.server";
import { writeAudit } from "../core/audit.server";
import { notify } from "../notifications/notifications.server";
import { assertTransition, leadTransitions, taskTransitions } from "../core/state-machines";
import { listParamsSchema, likePattern, paginate, rangeFor, type ListParams } from "../core/query";
import { notFound } from "../core/errors";
import type { Db, ServiceContext } from "../core/context.server";
import type {
  ActivityInput,
  CompanyInput,
  ContactInput,
  CreateLeadInput,
  OpportunityInput,
  TaskInput,
} from "./crm.schemas";
import { findCompanyDuplicates, findContactDuplicates, findExistingLead } from "./duplicates.server";

/* --------------------------------- Leads --------------------------------- */

/**
 * Création (ou enrichissement) d'un prospect.
 * Utilisée par les formulaires publics ET la saisie manuelle : la règle de
 * déduplication est donc unique et centralisée.
 */
export async function createOrEnrichLead(
  db: Db,
  input: CreateLeadInput,
  actorId: string | null,
): Promise<{ leadId: string; duplicate: boolean }> {
  const existing = await findExistingLead(db, input.email);

  if (existing) {
    await db.from("notes").insert({
      entity_type: "lead",
      entity_id: existing.id,
      body: `Nouvelle soumission (${input.source}) : ${input.message ?? "sans message"}`,
    });
    await writeAudit({
      module: "crm",
      action: "update",
      tableName: "leads",
      recordId: existing.id,
      actorId,
      after: { enriched: true, source: input.source },
    });
    return { leadId: existing.id, duplicate: true };
  }

  const { data, error } = await db
    .from("leads")
    .insert({
      full_name: input.fullName,
      email: input.email,
      phone: input.phone ?? null,
      company_name: input.companyName ?? null,
      message: input.message ?? null,
      service_id: input.serviceId ?? null,
      source: input.source,
      status: "new",
      utm: input.utm as never,
    })
    .select("id")
    .single();
  if (error) throw error;

  await writeAudit({
    module: "crm",
    action: "insert",
    tableName: "leads",
    recordId: data.id,
    actorId,
    after: { source: input.source },
  });

  await notify({
    event: "lead_created",
    title: `Nouveau prospect : ${input.fullName}`,
    body: input.message ?? undefined,
    entityType: "lead",
    entityId: data.id,
    payload: { source: input.source },
  });

  return { leadId: data.id, duplicate: false };
}

export async function updateLeadStatus(
  ctx: ServiceContext,
  input: { leadId: string; status: string; note?: string | undefined },
): Promise<void> {
  await requirePermission(ctx, "leads.update");

  const { data: lead } = await ctx.supabase
    .from("leads")
    .select("id, status")
    .eq("id", input.leadId)
    .maybeSingle();
  if (!lead) throw notFound("Prospect");

  assertTransition(
    leadTransitions,
    lead.status as never,
    input.status as never,
    "prospect",
  );

  const { error } = await ctx.supabase
    .from("leads")
    .update({ status: input.status as never })
    .eq("id", input.leadId);
  if (error) throw error;

  await logActivity(ctx, {
    entityType: "lead",
    entityId: input.leadId,
    type: "note",
    subject: `Statut : ${lead.status} → ${input.status}`,
    body: input.note,
  });

  await writeAudit({
    module: "crm",
    action: "update",
    tableName: "leads",
    recordId: input.leadId,
    actorId: ctx.userId,
    before: { status: lead.status },
    after: { status: input.status },
  });
}

/**
 * Conversion d'un prospect : entreprise (optionnelle) + contact + opportunité.
 * Les doublons ne sont jamais fusionnés automatiquement : ils sont renvoyés.
 */
export async function convertLead(
  ctx: ServiceContext,
  input: { leadId: string; companyId?: string | undefined; stageId: string; amount?: number },
): Promise<{ contactId: string; companyId: string | null; opportunityId: string }> {
  await requirePermission(ctx, "leads.update");

  const { data: lead } = await ctx.supabase
    .from("leads")
    .select("*")
    .eq("id", input.leadId)
    .maybeSingle();
  if (!lead) throw notFound("Prospect");

  assertTransition(leadTransitions, lead.status as never, "converted" as never, "prospect");

  let companyId = input.companyId ?? null;
  if (!companyId && lead.company_name) {
    const { data: company, error } = await ctx.supabase
      .from("companies")
      .insert({ name: lead.company_name, email: lead.email, phone: lead.phone })
      .select("id")
      .single();
    if (error) throw error;
    companyId = company.id;
  }

  const [firstName, ...rest] = lead.full_name.split(" ");
  const { data: contact, error: contactError } = await ctx.supabase
    .from("contacts")
    .insert({
      first_name: firstName ?? lead.full_name,
      last_name: rest.join(" ") || null,
      email: lead.email,
      phone: lead.phone,
      company_id: companyId,
      is_primary: true,
    })
    .select("id")
    .single();
  if (contactError) throw contactError;

  const { data: opportunity, error: oppError } = await ctx.supabase
    .from("opportunities")
    .insert({
      title: `${lead.company_name ?? lead.full_name} — opportunité`,
      company_id: companyId,
      contact_id: contact.id,
      lead_id: lead.id,
      stage_id: input.stageId,
      amount: input.amount ?? 0,
    })
    .select("id")
    .single();
  if (oppError) throw oppError;

  const { error: leadError } = await ctx.supabase
    .from("leads")
    .update({
      status: "converted",
      converted_contact_id: contact.id,
      converted_company_id: companyId,
    })
    .eq("id", lead.id);
  if (leadError) throw leadError;

  await writeAudit({
    module: "crm",
    action: "sensitive_change",
    tableName: "leads",
    recordId: lead.id,
    actorId: ctx.userId,
    after: { contactId: contact.id, companyId, opportunityId: opportunity.id },
  });

  return { contactId: contact.id, companyId, opportunityId: opportunity.id };
}

export async function listLeads(
  ctx: ServiceContext,
  params: ListParams & { status?: string | undefined; source?: string | undefined },
) {
  await requirePermission(ctx, "leads.read");
  const parsed = listParamsSchema.parse(params);
  const [start, end] = rangeFor(parsed);

  let query = ctx.supabase
    .from("leads")
    .select("id, full_name, email, phone, company_name, source, status, score, created_at", {
      count: "exact",
    })
    .is("deleted_at", null);

  if (params.status) query = query.eq("status", params.status as never);
  if (params.source) query = query.eq("source", params.source as never);
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

/* ------------------------- Entreprises & contacts ------------------------- */

export async function createCompany(ctx: ServiceContext, input: CompanyInput) {
  await requirePermission(ctx, "companies.create");

  const duplicates = await findCompanyDuplicates(ctx.supabase, {
    name: input.name,
    email: input.email,
    website: input.website,
  });

  const { data, error } = await ctx.supabase
    .from("companies")
    .insert({
      name: input.name,
      legal_name: input.legalName ?? null,
      website: input.website ?? null,
      industry: input.industry ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      city: input.city ?? null,
      country: input.country ?? null,
      notes: input.notes ?? null,
      owner_id: ctx.userId,
    })
    .select("id")
    .single();
  if (error) throw error;

  return { companyId: data.id, duplicates };
}

export async function createContact(ctx: ServiceContext, input: ContactInput) {
  await requirePermission(ctx, "contacts.create");

  const duplicates = await findContactDuplicates(ctx.supabase, {
    email: input.email,
    phone: input.phone,
  });

  const { data, error } = await ctx.supabase
    .from("contacts")
    .insert({
      first_name: input.firstName,
      last_name: input.lastName ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      job_title: input.jobTitle ?? null,
      company_id: input.companyId ?? null,
      is_primary: input.isPrimary,
      notes: input.notes ?? null,
      owner_id: ctx.userId,
    })
    .select("id")
    .single();
  if (error) throw error;

  return { contactId: data.id, duplicates };
}

/* ----------------------------- Opportunités ------------------------------ */

export async function createOpportunity(ctx: ServiceContext, input: OpportunityInput) {
  await requirePermission(ctx, "opportunities.create");

  const { data, error } = await ctx.supabase
    .from("opportunities")
    .insert({
      title: input.title,
      company_id: input.companyId ?? null,
      contact_id: input.contactId ?? null,
      lead_id: input.leadId ?? null,
      stage_id: input.stageId,
      amount: input.amount,
      currency: input.currency,
      expected_close_date: input.expectedCloseDate ?? null,
      owner_id: ctx.userId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { opportunityId: data.id };
}

/** Déplacement dans le pipeline : historisé par trigger + activité métier. */
export async function moveOpportunity(
  ctx: ServiceContext,
  input: { opportunityId: string; stageId: string; lossReason?: string | undefined; note?: string | undefined },
) {
  await requirePermission(ctx, "opportunities.update");

  const { data: stage } = await ctx.supabase
    .from("pipeline_stages")
    .select("id, name, is_won, is_lost")
    .eq("id", input.stageId)
    .maybeSingle();
  if (!stage) throw notFound("Étape du pipeline");

  const closed = stage.is_won || stage.is_lost;
  const { error } = await ctx.supabase
    .from("opportunities")
    .update({
      stage_id: input.stageId,
      closed_at: closed ? new Date().toISOString() : null,
      loss_reason: stage.is_lost ? (input.lossReason ?? null) : null,
    })
    .eq("id", input.opportunityId);
  if (error) throw error;

  await logActivity(ctx, {
    entityType: "opportunity",
    entityId: input.opportunityId,
    type: "note",
    subject: `Étape : ${stage.name}`,
    body: input.note,
  });
}

export async function pipelineOverview(ctx: ServiceContext) {
  await requirePermission(ctx, "opportunities.read");
  const { data, error } = await ctx.supabase
    .from("v_pipeline_overview")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/* ------------------------- Activités & tâches ---------------------------- */

export async function logActivity(ctx: ServiceContext, input: ActivityInput) {
  const { error } = await ctx.supabase.from("activities").insert({
    entity_type: input.entityType,
    entity_id: input.entityId,
    type: input.type as never,
    subject: input.subject ?? null,
    body: input.body ?? null,
    occurred_at: input.occurredAt ?? new Date().toISOString(),
    duration_minutes: input.durationMinutes ?? null,
    owner_id: ctx.userId,
  });
  if (error) throw error;
}

export async function createTask(ctx: ServiceContext, input: TaskInput) {
  await requirePermission(ctx, "tasks.create");

  const { data, error } = await ctx.supabase
    .from("tasks")
    .insert({
      title: input.title,
      description: input.description ?? null,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      priority: input.priority,
      due_at: input.dueAt ?? null,
      assignee_id: input.assigneeId ?? null,
      status: "todo",
    })
    .select("id")
    .single();
  if (error) throw error;

  if (input.assigneeId && input.assigneeId !== ctx.userId) {
    await notify({
      event: "task_assigned",
      title: `Tâche assignée : ${input.title}`,
      entityType: "task",
      entityId: data.id,
      userIds: [input.assigneeId],
    });
  }

  return { taskId: data.id };
}

export async function updateTaskStatus(
  ctx: ServiceContext,
  input: { taskId: string; status: string },
) {
  await requirePermission(ctx, "tasks.update");

  const { data: task } = await ctx.supabase
    .from("tasks")
    .select("id, status")
    .eq("id", input.taskId)
    .maybeSingle();
  if (!task) throw notFound("Tâche");

  assertTransition(taskTransitions, task.status as never, input.status as never, "tâche");

  const { error } = await ctx.supabase
    .from("tasks")
    .update({
      status: input.status as never,
      completed_at: input.status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", input.taskId);
  if (error) throw error;
}