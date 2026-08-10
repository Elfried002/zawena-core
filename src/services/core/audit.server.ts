/**
 * Traçabilité (serveur uniquement).
 * Les tables sensibles sont déjà couvertes par le trigger `audit_row_change`.
 * Ce service journalise en plus les *actions métier* (envoi, publication,
 * changement de rôle, révision de devis…).
 */
import { adminDb } from "./context.server";

export type AuditAction = "insert" | "update" | "delete" | "sensitive_change";

export interface AuditEntry {
  module: string;
  action: AuditAction;
  tableName?: string;
  recordId?: string;
  actorId?: string | null;
  before?: unknown;
  after?: unknown;
}

export async function writeAudit(entry: AuditEntry): Promise<void> {
  try {
    const db = await adminDb();
    await db.from("audit_logs").insert({
      module: entry.module,
      action: entry.action,
      table_name: entry.tableName ?? null,
      record_id: entry.recordId ?? null,
      actor_id: entry.actorId ?? null,
      before_data: (entry.before ?? null) as never,
      after_data: (entry.after ?? null) as never,
    });
  } catch (error) {
    // L'audit ne doit jamais faire échouer une opération métier valide.
    console.error("[audit] écriture impossible", error);
  }
}