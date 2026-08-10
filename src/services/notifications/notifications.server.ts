/**
 * Système de notifications centralisé (serveur uniquement).
 * Canal actif : `dashboard`. Les canaux email/SMS/WhatsApp/webhook sont
 * modélisés mais non branchés (aucun fournisseur imposé).
 */
import { adminDb } from "../core/context.server";
import type { Database } from "@/integrations/supabase/types";

export type NotificationEvent = Database["public"]["Enums"]["notification_event"];
export type NotificationChannel = Database["public"]["Enums"]["notification_channel"];

export interface NotifyInput {
  event: NotificationEvent;
  title: string;
  body?: string | undefined;
  entityType?: string | undefined;
  entityId?: string | undefined;
  link?: string | undefined;
  payload?: Record<string, unknown> | undefined;
  /** Destinataires explicites. À défaut, tous les rôles concernés sont notifiés. */
  userIds?: string[] | undefined;
  roles?: Database["public"]["Enums"]["app_role"][] | undefined;
  channel?: NotificationChannel | undefined;
}

/** Rôles notifiés par défaut pour chaque événement métier. */
const DEFAULT_AUDIENCE: Record<
  NotificationEvent,
  Database["public"]["Enums"]["app_role"][]
> = {
  lead_created: ["admin", "sales"],
  quote_request_created: ["admin", "sales"],
  ticket_created: ["admin", "support"],
  ticket_replied: ["admin", "support"],
  ticket_assigned: ["admin", "support"],
  quote_sent: ["admin", "sales"],
  quote_accepted: ["admin", "sales", "finance"],
  invoice_sent: ["admin", "finance"],
  payment_recorded: ["admin", "finance"],
  task_assigned: ["admin"],
};

async function resolveRecipients(input: NotifyInput): Promise<string[]> {
  if (input.userIds?.length) return [...new Set(input.userIds)];

  const roles = input.roles ?? DEFAULT_AUDIENCE[input.event];
  const db = await adminDb();
  const { data } = await db.from("user_roles").select("user_id").in("role", roles);
  return [...new Set((data ?? []).map((row) => row.user_id))];
}

export async function notify(input: NotifyInput): Promise<void> {
  try {
    const recipients = await resolveRecipients(input);
    if (recipients.length === 0) return;

    const db = await adminDb();
    await db.from("notifications").insert(
      recipients.map((userId) => ({
        user_id: userId,
        event: input.event,
        channel: input.channel ?? "dashboard",
        title: input.title,
        body: input.body ?? null,
        entity_type: input.entityType ?? null,
        entity_id: input.entityId ?? null,
        link: input.link ?? null,
        payload: (input.payload ?? {}) as never,
      })),
    );
  } catch (error) {
    // Une notification perdue ne doit jamais annuler l'opération métier.
    console.error("[notifications] envoi impossible", error);
  }
}

export async function markNotificationRead(
  ctx: { supabase: Awaited<ReturnType<typeof adminDb>>; userId: string },
  notificationId: string,
): Promise<void> {
  await ctx.supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", ctx.userId);
}