/**
 * Numérotation des documents (serveur uniquement).
 * La fonction SQL `next_document_number` n'est plus exécutable par les
 * utilisateurs connectés (durcissement sécurité) : elle est appelée ici
 * via le client de service, après vérification des permissions métier.
 */
import { adminDb } from "./context.server";
import { invalidState } from "./errors";

export async function nextDocumentNumber(key: "quote" | "invoice" | "ticket"): Promise<string> {
  const db = await adminDb();
  const { data, error } = await db.rpc("next_document_number", { _key: key });
  if (error || !data) throw error ?? invalidState("Numérotation indisponible");
  return data as string;
}
