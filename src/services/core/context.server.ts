/**
 * Contexte d'exécution des services métier (serveur uniquement).
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export type Db = SupabaseClient<Database>;

/** Client agissant AU NOM de l'utilisateur connecté (RLS appliquée). */
export interface ServiceContext {
  supabase: Db;
  userId: string;
}

/** Client de service (RLS contournée) — réservé aux opérations vérifiées. */
export async function adminDb(): Promise<Db> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as Db;
}

/** Client publiable côté serveur : lectures publiques uniquement (rôle anon). */
export async function publicDb(): Promise<Db> {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Configuration Supabase serveur incomplète");

  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  }) as unknown as Db;
}