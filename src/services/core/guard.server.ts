/**
 * Couche d'autorisation (serveur uniquement).
 * Toute écriture métier passe par ces gardes : le rôle affiché dans l'UI n'a
 * aucune valeur de sécurité.
 */
import type { Permission } from "./permissions";
import { forbidden, unauthorized } from "./errors";
import type { Db, ServiceContext } from "./context.server";

/** Vérifie qu'une permission d'action est accordée à l'utilisateur courant. */
export async function requirePermission(
  ctx: ServiceContext,
  permission: Permission,
): Promise<void> {
  if (!ctx.userId) throw unauthorized();

  const { data: active, error: activeError } = await ctx.supabase.rpc("is_account_active");
  if (activeError) throw forbidden("Impossible de vérifier le statut du compte");
  if (!active) throw forbidden("Compte inactif ou suspendu");

  const { data, error } = await ctx.supabase.rpc("has_permission", {
    _user_id: ctx.userId,
    _permission: permission,
  });
  if (error) throw forbidden("Impossible de vérifier les permissions");
  if (!data) throw forbidden(`Permission requise : ${permission}`);
}

export async function requireAnyPermission(
  ctx: ServiceContext,
  permissions: Permission[],
): Promise<void> {
  for (const permission of permissions) {
    try {
      await requirePermission(ctx, permission);
      return;
    } catch {
      // essaie la permission suivante
    }
  }
  throw forbidden(`Une de ces permissions est requise : ${permissions.join(", ")}`);
}

export async function requireAdmin(ctx: ServiceContext): Promise<void> {
  const { data, error } = await ctx.supabase.rpc("is_admin");
  if (error || !data) throw forbidden("Réservé aux administrateurs");
}

export async function requireStaff(ctx: ServiceContext): Promise<void> {
  const { data, error } = await ctx.supabase.rpc("is_staff");
  if (error || !data) throw forbidden("Réservé à l'équipe Zawena");
}

export async function listMyPermissions(ctx: ServiceContext): Promise<string[]> {
  const { data, error } = await ctx.supabase.rpc("my_permissions");
  if (error) return [];
  return (data ?? []).map((row: { permission: string }) => row.permission);
}

/** Rôles de l'utilisateur courant (lecture propre autorisée par RLS). */
export async function listMyRoles(ctx: ServiceContext): Promise<string[]> {
  const { data } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId);
  return (data ?? []).map((row) => row.role as string);
}

/**
 * Concurrence optimiste : refuse la mise à jour si la version attendue ne
 * correspond plus à la version en base (pas d'écrasement silencieux).
 */
export async function assertLockVersion(
  db: Db,
  table: "quotes" | "invoices",
  id: string,
  expected: number | undefined,
): Promise<void> {
  if (expected === undefined) return;
  const { conflict, notFound } = await import("./errors");
  const { data, error } = await db.from(table).select("lock_version").eq("id", id).maybeSingle();
  if (error) throw conflict();
  if (!data) throw notFound();
  if (data.lock_version !== expected) throw conflict();
}