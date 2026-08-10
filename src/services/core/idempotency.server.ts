/**
 * Idempotence des opérations sensibles (serveur uniquement).
 * Une même clé (scope + key) ne peut produire l'effet qu'une seule fois ;
 * les appels répétés renvoient le résultat mémorisé.
 */
import { adminDb } from "./context.server";

export async function runOnce<T>(
  scope: string,
  key: string,
  actorId: string | null,
  operation: () => Promise<T>,
): Promise<{ result: T; replayed: boolean }> {
  const db = await adminDb();

  const { data: existing } = await db
    .from("idempotency_keys")
    .select("result")
    .eq("scope", scope)
    .eq("key", key)
    .maybeSingle();

  if (existing) {
    return { result: existing.result as T, replayed: true };
  }

  // Réservation atomique : une clé déjà prise signifie un appel concurrent.
  const { error: reserveError } = await db
    .from("idempotency_keys")
    .insert({ scope, key, actor_id: actorId });

  if (reserveError) {
    const { data: raced } = await db
      .from("idempotency_keys")
      .select("result")
      .eq("scope", scope)
      .eq("key", key)
      .maybeSingle();
    if (raced) return { result: raced.result as T, replayed: true };
    throw reserveError;
  }

  try {
    const result = await operation();
    await db
      .from("idempotency_keys")
      .update({ result: (result ?? null) as never })
      .eq("scope", scope)
      .eq("key", key);
    return { result, replayed: false };
  } catch (error) {
    // Échec → la clé est libérée pour permettre une nouvelle tentative.
    await db.from("idempotency_keys").delete().eq("scope", scope).eq("key", key);
    throw error;
  }
}