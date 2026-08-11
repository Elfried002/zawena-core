/**
 * Contexte back-office (serveur uniquement).
 * Fournit le ServiceContext utilisé par toutes les server functions admin,
 * le contexte d'interface (`getMyContext`) et la gestion des utilisateurs.
 * Aucune décision de sécurité n'est prise côté client : chaque appel repasse
 * par `requirePermission` / RLS.
 */
import { forbidden, notFound, validationError } from "@/services/core/errors";
import { requirePermission } from "@/services/core/guard.server";
import { writeAudit } from "@/services/core/audit.server";
import { assertTransition, userStatusTransitions } from "@/services/core/state-machines";
import { STAFF_ROLES, type AppRole } from "@/services/core/permissions";
import type { Db, ServiceContext } from "@/services/core/context.server";

/**
 * Client non typé : indispensable pour les lectures/écritures génériques par
 * table. La validation reste assurée par Zod côté entrée et RLS côté base.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function loose(db: Db): any {
  return db as any;
}

export interface MyContext {
  userId: string;
  email: string | null;
  fullName: string | null;
  jobTitle: string | null;
  avatarUrl: string | null;
  accountStatus: string;
  roles: AppRole[];
  permissions: string[];
  isStaff: boolean;
}

/**
 * Contexte d'interface. Sert UNIQUEMENT à piloter l'affichage (menus, boutons).
 * Ne constitue jamais une garde de sécurité.
 */
export async function getMyContext(ctx: ServiceContext): Promise<MyContext> {
  const { data: profile } = await ctx.supabase
    .from("profiles")
    .select("id, email, full_name, job_title, avatar_url, status")
    .eq("id", ctx.userId)
    .maybeSingle();

  const { data: roleRows } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId);

  const { data: permissionRows } = await ctx.supabase.rpc("my_permissions");

  const roles = (roleRows ?? []).map((row) => row.role as AppRole);

  return {
    userId: ctx.userId,
    email: profile?.email ?? null,
    fullName: profile?.full_name ?? null,
    jobTitle: profile?.job_title ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    accountStatus: profile?.status ?? "active",
    roles,
    permissions: (permissionRows ?? []).map((row) => row.permission),
    isStaff: roles.some((role) => STAFF_ROLES.includes(role)),
  };
}

/* ----------------------------- Profil courant ----------------------------- */

export interface ProfileUpdateInput {
  fullName?: string | undefined;
  jobTitle?: string | undefined;
  phone?: string | undefined;
  locale?: string | undefined;
}

export async function updateMyProfile(
  ctx: ServiceContext,
  input: ProfileUpdateInput,
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (input.fullName !== undefined) patch["full_name"] = input.fullName;
  if (input.jobTitle !== undefined) patch["job_title"] = input.jobTitle;
  if (input.phone !== undefined) patch["phone"] = input.phone;
  if (input.locale !== undefined) patch["locale"] = input.locale;
  if (Object.keys(patch).length === 0) return;

  // RLS restreint déjà la ligne modifiable au propriétaire du profil.
  const { error } = await loose(ctx.supabase).from("profiles").update(patch).eq("id", ctx.userId);
  if (error) throw error;
}

/* --------------------------- Utilisateurs & rôles -------------------------- */

export async function setUserStatus(
  ctx: ServiceContext,
  input: { userId: string; status: string },
): Promise<void> {
  await requirePermission(ctx, "users.update");
  if (input.userId === ctx.userId) {
    throw validationError("Vous ne pouvez pas modifier votre propre statut de compte");
  }

  const { data: profile } = await ctx.supabase
    .from("profiles")
    .select("id, status")
    .eq("id", input.userId)
    .maybeSingle();
  if (!profile) throw notFound("Utilisateur");

  assertTransition(
    userStatusTransitions,
    profile.status as never,
    input.status as never,
    "compte utilisateur",
  );

  const patch: Record<string, unknown> = {
    status: input.status,
    is_active: input.status === "active",
    suspended_at: input.status === "suspended" ? new Date().toISOString() : null,
  };

  const { error } = await loose(ctx.supabase).from("profiles").update(patch).eq("id", input.userId);
  if (error) throw error;

  await writeAudit({
    module: "users",
    action: "sensitive_change",
    tableName: "profiles",
    recordId: input.userId,
    actorId: ctx.userId,
    before: { status: profile.status },
    after: { status: input.status },
  });
}

export async function setUserRole(
  ctx: ServiceContext,
  input: { userId: string; role: AppRole; grant: boolean },
): Promise<void> {
  await requirePermission(ctx, "users.roles.manage");
  if (input.userId === ctx.userId) {
    throw validationError("Vous ne pouvez pas modifier vos propres rôles");
  }
  if (input.role === "super_admin") {
    throw forbidden("Le rôle super_admin ne peut pas être attribué depuis l'interface");
  }

  if (input.grant) {
    const { error } = await ctx.supabase
      .from("user_roles")
      .insert({ user_id: input.userId, role: input.role });
    if (error && error.code !== "23505") throw error;
  } else {
    const { error } = await ctx.supabase
      .from("user_roles")
      .delete()
      .eq("user_id", input.userId)
      .eq("role", input.role);
    if (error) throw error;
  }

  await writeAudit({
    module: "users",
    action: "sensitive_change",
    tableName: "user_roles",
    recordId: input.userId,
    actorId: ctx.userId,
    after: { role: input.role, granted: input.grant },
  });
}

/** Matrice rôles → permissions telle que définie en base (lecture seule). */
export async function rolePermissionMatrix(ctx: ServiceContext) {
  await requirePermission(ctx, "users.read");
  const { data, error } = await ctx.supabase
    .from("role_permissions")
    .select("role, permission")
    .order("role", { ascending: true });
  if (error) throw error;

  const byRole = new Map<string, string[]>();
  for (const row of data ?? []) {
    const list = byRole.get(row.role) ?? [];
    list.push(row.permission);
    byRole.set(row.role, list);
  }
  return [...byRole.entries()].map(([role, permissions]) => ({
    role,
    permissions: permissions.sort(),
  }));
}