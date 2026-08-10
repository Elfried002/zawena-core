/**
 * Détection de doublons (serveur uniquement).
 * Aucune fusion ni suppression automatique : on renvoie des candidats que
 * l'administrateur peut rattacher ou fusionner explicitement.
 */
import type { Db } from "../core/context.server";

export interface DuplicateCandidate {
  id: string;
  label: string;
  reason: "email" | "phone" | "domain" | "name";
}

function domainOf(email?: string | null): string | null {
  if (!email?.includes("@")) return null;
  const domain = email.split("@")[1]?.toLowerCase() ?? null;
  const generic = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
  return domain && !generic.includes(domain) ? domain : null;
}

export async function findContactDuplicates(
  db: Db,
  input: { email?: string | undefined; phone?: string | undefined },
): Promise<DuplicateCandidate[]> {
  const candidates: DuplicateCandidate[] = [];

  if (input.email) {
    const { data } = await db
      .from("contacts")
      .select("id, first_name, last_name, email")
      .eq("email", input.email)
      .is("deleted_at", null)
      .limit(5);
    for (const row of data ?? []) {
      candidates.push({
        id: row.id,
        label: `${row.first_name} ${row.last_name ?? ""}`.trim(),
        reason: "email",
      });
    }
  }

  if (input.phone) {
    const { data } = await db
      .from("contacts")
      .select("id, first_name, last_name")
      .eq("phone", input.phone)
      .is("deleted_at", null)
      .limit(5);
    for (const row of data ?? []) {
      if (candidates.some((c) => c.id === row.id)) continue;
      candidates.push({
        id: row.id,
        label: `${row.first_name} ${row.last_name ?? ""}`.trim(),
        reason: "phone",
      });
    }
  }

  return candidates;
}

export async function findCompanyDuplicates(
  db: Db,
  input: { name?: string | undefined; email?: string | undefined; website?: string | undefined },
): Promise<DuplicateCandidate[]> {
  const candidates: DuplicateCandidate[] = [];
  const domain = domainOf(input.email) ?? (input.website ? domainOf(`x@${input.website}`) : null);

  if (input.name) {
    const { data } = await db
      .from("companies")
      .select("id, name")
      .ilike("name", input.name)
      .is("deleted_at", null)
      .limit(5);
    for (const row of data ?? []) candidates.push({ id: row.id, label: row.name, reason: "name" });
  }

  if (domain) {
    const { data } = await db
      .from("companies")
      .select("id, name, email, website")
      .or(`email.ilike.%${domain},website.ilike.%${domain}%`)
      .is("deleted_at", null)
      .limit(5);
    for (const row of data ?? []) {
      if (candidates.some((c) => c.id === row.id)) continue;
      candidates.push({ id: row.id, label: row.name, reason: "domain" });
    }
  }

  return candidates;
}

/** Recherche d'un prospect déjà existant sur le même email (fenêtre glissante). */
export async function findExistingLead(
  db: Db,
  email: string,
  withinDays = 90,
): Promise<{ id: string; status: string } | null> {
  const since = new Date(Date.now() - withinDays * 86_400_000).toISOString();
  const { data } = await db
    .from("leads")
    .select("id, status")
    .eq("email", email)
    .is("deleted_at", null)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? { id: data.id, status: data.status as string } : null;
}