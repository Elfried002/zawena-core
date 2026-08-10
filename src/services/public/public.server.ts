/**
 * Lectures publiques du CMS (serveur uniquement).
 * Règles : client publiable (rôle anon), projections explicites, filtrage
 * `status = published`. Aucune colonne interne n'est sélectionnée.
 */
import { publicDb } from "../core/context.server";
import { notFound } from "../core/errors";
import {
  projectContentSchema,
  serviceContentSchema,
  type PublicFaq,
  type PublicProject,
  type PublicService,
  type PublicTechnology,
} from "./public.types";

const SERVICE_FIELDS = "slug, title, summary, icon, seo_title, seo_description, is_featured, sort_order, content";
const PROJECT_FIELDS =
  "slug, title, summary, industry, seo_title, seo_description, is_featured, sort_order, content";

type ServiceRow = {
  slug: string;
  title: string;
  summary: string | null;
  icon: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_featured: boolean;
  content: unknown;
};

type ProjectRow = {
  slug: string;
  title: string;
  summary: string | null;
  industry: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_featured: boolean;
  content: unknown;
};

function toService(row: ServiceRow): PublicService {
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? "",
    icon: row.icon ?? "sparkles",
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    isFeatured: row.is_featured,
    content: serviceContentSchema.parse(row.content ?? {}),
  };
}

function toProject(row: ProjectRow): PublicProject {
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? "",
    industry: row.industry,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    isFeatured: row.is_featured,
    content: projectContentSchema.parse(row.content ?? {}),
  };
}

export async function getPublishedServices(): Promise<PublicService[]> {
  const db = await publicDb();
  const { data, error } = await db
    .from("services")
    .select(SERVICE_FIELDS)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as unknown as ServiceRow[]).map(toService);
}

export async function getPublishedService(slug: string): Promise<PublicService> {
  const db = await publicDb();
  const { data, error } = await db
    .from("services")
    .select(SERVICE_FIELDS)
    .eq("status", "published")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFound("Service");
  return toService(data as unknown as ServiceRow);
}

export async function getPublishedProjects(filters: { category?: string } = {}): Promise<PublicProject[]> {
  const db = await publicDb();
  let query = db
    .from("projects")
    .select(PROJECT_FIELDS)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  if (filters.category) query = query.eq("content->>category", filters.category);

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as ProjectRow[]).map(toProject);
}

export async function getPublishedProject(slug: string): Promise<PublicProject> {
  const db = await publicDb();
  const { data, error } = await db
    .from("projects")
    .select(PROJECT_FIELDS)
    .eq("status", "published")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFound("Réalisation");
  return toProject(data as unknown as ProjectRow);
}

export async function getPublishedFaq(category?: string): Promise<PublicFaq[]> {
  const db = await publicDb();
  let query = db
    .from("faqs")
    .select("id, question, answer, category")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) throw error;
  return data as PublicFaq[];
}

export async function getActiveTechnologies(): Promise<PublicTechnology[]> {
  const db = await publicDb();
  const { data, error } = await db
    .from("technologies")
    .select("name, category")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as PublicTechnology[];
}

/** Résout un slug de service en identifiant, pour rattacher un formulaire. */
export async function resolveServiceId(slug: string): Promise<string | null> {
  const db = await publicDb();
  const { data, error } = await db
    .from("services")
    .select("id")
    .eq("status", "published")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}
