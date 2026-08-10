/**
 * Logique métier CMS (serveur uniquement).
 * Workflow éditorial : draft → review → scheduled/published → archived.
 */
import { requirePermission } from "../core/guard.server";
import { writeAudit } from "../core/audit.server";
import { assertTransition, contentTransitions } from "../core/state-machines";
import { notFound, validationError } from "../core/errors";
import type { ServiceContext } from "../core/context.server";
import type { Permission } from "../core/permissions";
import {
  slugify,
  type BlogPostInput,
  type CmsEntity,
  type FaqInput,
  type PageInput,
  type ProjectInput,
  type RegisterMediaInput,
  type ServiceInput,
} from "./cms.schemas";

/**
 * Accès non typé volontaire : les opérations génériques ci-dessous s'appliquent à
 * plusieurs tables CMS, ce que les types générés (littéraux par table) ne
 * peuvent pas exprimer. La validation reste assurée par Zod + RLS.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
function loose(ctx: ServiceContext): any {
  return ctx.supabase as any;
}

/* --------------------------------- Slugs --------------------------------- */

/** Slug unique par entité : suffixe incrémental si déjà pris. */
async function uniqueSlug(
  ctx: ServiceContext,
  entity: CmsEntity,
  desired: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(desired);
  if (!base) throw validationError("Titre invalide pour générer un slug");

  for (let i = 0; i < 50; i += 1) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    let query = loose(ctx).from(entity).select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query;
    if (!data || data.length === 0) return candidate;
  }
  return `${base}-${Date.now()}`;
}

/* -------------------------- Mapping SEO commun --------------------------- */

function seoColumns(input: {
  seoTitle?: string | undefined;
  seoDescription?: string | undefined;
}) {
  return {
    seo_title: input.seoTitle ?? null,
    seo_description: input.seoDescription ?? null,
  };
}

/* --------------------------------- Pages --------------------------------- */

export async function createPage(ctx: ServiceContext, input: PageInput) {
  await requirePermission(ctx, "pages.create");
  const slug = await uniqueSlug(ctx, "pages", input.slug ?? input.title);

  const { data, error } = await ctx.supabase
    .from("pages")
    .insert({
      slug,
      title: input.title,
      excerpt: input.excerpt ?? null,
      content: input.content as never,
      cover_media_id: input.coverMediaId ?? null,
      status: "draft",
      sort_order: input.sortOrder ?? 0,
      noindex: input.noindex ?? false,
      seo_keywords: input.seoKeywords ?? null,
      og_image_url: input.ogImageUrl ?? null,
      ...seoColumns(input),
    })
    .select("id, slug")
    .single();
  if (error) throw error;
  return { pageId: data.id, slug: data.slug };
}

export async function updatePage(ctx: ServiceContext, id: string, input: PageInput) {
  await requirePermission(ctx, "pages.update");
  const slug = input.slug ? await uniqueSlug(ctx, "pages", input.slug, id) : undefined;

  const { error } = await ctx.supabase
    .from("pages")
    .update({
      ...(slug ? { slug } : {}),
      title: input.title,
      excerpt: input.excerpt ?? null,
      content: input.content as never,
      cover_media_id: input.coverMediaId ?? null,
      sort_order: input.sortOrder ?? 0,
      noindex: input.noindex ?? false,
      seo_keywords: input.seoKeywords ?? null,
      og_image_url: input.ogImageUrl ?? null,
      ...seoColumns(input),
    })
    .eq("id", id);
  if (error) throw error;
}

/* -------------------------------- Services ------------------------------- */

/** Table de liaison remplacée intégralement : évite les doublons de technos. */
async function syncJoin(
  ctx: ServiceContext,
  table: "service_technologies" | "project_technologies",
  column: "service_id" | "project_id",
  parentId: string,
  technologyIds: string[],
) {
  await loose(ctx).from(table).delete().eq(column, parentId);
  if (technologyIds.length === 0) return;
  const rows = technologyIds.map((technology_id) => ({ [column]: parentId, technology_id }));
  const { error } = await loose(ctx).from(table).insert(rows);
  if (error) throw error;
}

export async function createService(ctx: ServiceContext, input: ServiceInput) {
  await requirePermission(ctx, "services.create");
  const slug = await uniqueSlug(ctx, "services", input.slug ?? input.title);

  const { data, error } = await ctx.supabase
    .from("services")
    .insert({
      slug,
      title: input.title,
      summary: input.summary ?? null,
      content: input.content as never,
      icon: input.icon ?? null,
      cover_media_id: input.coverMediaId ?? null,
      is_featured: input.isFeatured,
      status: "draft",
      sort_order: input.sortOrder ?? 0,
      ...seoColumns(input),
    })
    .select("id, slug")
    .single();
  if (error) throw error;

  await syncJoin(ctx, "service_technologies", "service_id", data.id, input.technologyIds);
  return { serviceId: data.id, slug: data.slug };
}

/* ------------------------------- Portfolio ------------------------------- */

/**
 * Réalisation. Un contenu de démonstration est explicitement marqué dans le
 * corps du contenu : il ne doit jamais être présenté comme une référence réelle.
 */
export async function createProject(ctx: ServiceContext, input: ProjectInput) {
  await requirePermission(ctx, "projects.create");
  const slug = await uniqueSlug(ctx, "projects", input.slug ?? input.title);

  const { data, error } = await ctx.supabase
    .from("projects")
    .insert({
      slug,
      title: input.title,
      client_name: input.isDemo ? null : (input.clientName ?? null),
      industry: input.industry ?? null,
      summary: input.summary ?? null,
      content: { ...input.content, is_demo: input.isDemo } as never,
      cover_media_id: input.coverMediaId ?? null,
      external_url: input.externalUrl ?? null,
      delivered_at: input.deliveredAt ?? null,
      is_featured: input.isFeatured,
      status: "draft",
      sort_order: input.sortOrder ?? 0,
      ...seoColumns(input),
    })
    .select("id, slug")
    .single();
  if (error) throw error;

  await syncJoin(ctx, "project_technologies", "project_id", data.id, input.technologyIds);
  return { projectId: data.id, slug: data.slug };
}

/* --------------------------------- Blog ---------------------------------- */

function estimateReadingMinutes(content: unknown): number {
  const words = JSON.stringify(content ?? {}).split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export async function createBlogPost(ctx: ServiceContext, input: BlogPostInput) {
  await requirePermission(ctx, "blog_posts.create");
  const slug = await uniqueSlug(ctx, "blog_posts", input.slug ?? input.title);

  const { data, error } = await ctx.supabase
    .from("blog_posts")
    .insert({
      slug,
      title: input.title,
      excerpt: input.excerpt ?? null,
      content: input.content as never,
      category_id: input.categoryId ?? null,
      cover_media_id: input.coverMediaId ?? null,
      author_id: input.authorId ?? ctx.userId,
      reading_minutes: input.readingMinutes ?? estimateReadingMinutes(input.content),
      status: "draft",
      og_image_url: input.ogImageUrl ?? null,
      ...seoColumns(input),
    })
    .select("id, slug")
    .single();
  if (error) throw error;

  if (input.tagIds.length > 0) {
    const { error: tagError } = await ctx.supabase
      .from("blog_post_tags")
      .insert(input.tagIds.map((tag_id) => ({ post_id: data.id, tag_id })));
    if (tagError) throw tagError;
  }

  return { postId: data.id, slug: data.slug };
}

/* ---------------------------------- FAQ ---------------------------------- */

export async function createFaq(ctx: ServiceContext, input: FaqInput) {
  await requirePermission(ctx, "faqs.create");
  const { data, error } = await ctx.supabase
    .from("faqs")
    .insert({
      question: input.question,
      answer: input.answer,
      category: input.category,
      service_id: input.serviceId ?? null,
      status: "draft",
      sort_order: input.sortOrder ?? 0,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { faqId: data.id };
}

/* -------------------------- Workflow éditorial --------------------------- */

const PUBLISH_PERMISSION: Record<CmsEntity, Permission> = {
  pages: "pages.publish",
  services: "services.publish",
  projects: "projects.publish",
  blog_posts: "blog_posts.publish",
  faqs: "faqs.publish",
};

/**
 * Changement de statut d'un contenu. La publication et la programmation
 * exigent la permission `*.publish` : un éditeur ne peut pas publier seul si
 * son rôle ne l'y autorise pas.
 */
export async function changeContentStatus(
  ctx: ServiceContext,
  input: { entity: CmsEntity; id: string; status: string; publishAt?: string | undefined },
): Promise<void> {
  const needsPublish = input.status === "published" || input.status === "scheduled";
  await requirePermission(
    ctx,
    needsPublish ? PUBLISH_PERMISSION[input.entity] : (`${input.entity}.update` as Permission),
  );

  const { data: row } = await loose(ctx)
    .from(input.entity)
    .select("id, status")
    .eq("id", input.id)
    .maybeSingle();
  if (!row) throw notFound("Contenu");

  assertTransition(contentTransitions, row.status as never, input.status as never, "contenu");

  if (input.status === "scheduled") {
    if (!input.publishAt) throw validationError("Date de publication requise");
    if (new Date(input.publishAt).getTime() <= Date.now()) {
      throw validationError("La date de publication doit être dans le futur");
    }
  }

  const publishedAt =
    input.status === "published"
      ? new Date().toISOString()
      : input.status === "scheduled"
        ? input.publishAt!
        : null;

  const { error } = await loose(ctx)
    .from(input.entity)
    .update({ status: input.status, published_at: publishedAt })
    .eq("id", input.id);
  if (error) throw error;

  await writeAudit({
    module: "cms",
    action: needsPublish ? "sensitive_change" : "update",
    tableName: input.entity,
    recordId: input.id,
    actorId: ctx.userId,
    before: { status: row.status },
    after: { status: input.status, publishedAt },
  });
}

/** Publication des contenus programmés arrivés à échéance (tâche planifiée). */
export async function publishScheduledContent(ctx: ServiceContext): Promise<number> {
  await requirePermission(ctx, "pages.publish");
  const now = new Date().toISOString();
  let total = 0;

  for (const entity of ["pages", "services", "projects", "blog_posts", "faqs"] as CmsEntity[]) {
    const { data } = await loose(ctx)
      .from(entity)
      .update({ status: "published" })
      .eq("status", "scheduled")
      .lte("published_at", now)
      .select("id");
    total += data?.length ?? 0;
  }
  return total;
}

/** Archivage (soft delete) : le contenu quitte le site sans perte d'historique. */
export async function archiveContent(
  ctx: ServiceContext,
  input: { entity: CmsEntity; id: string },
): Promise<void> {
  await requirePermission(ctx, `${input.entity}.delete` as Permission);
  const { error } = await loose(ctx)
    .from(input.entity)
    .update({ status: "archived", deleted_at: new Date().toISOString() })
    .eq("id", input.id);
  if (error) throw error;

  await writeAudit({
    module: "cms",
    action: "delete",
    tableName: input.entity,
    recordId: input.id,
    actorId: ctx.userId,
    after: { archived: true },
  });
}

/* --------------------------------- Médias -------------------------------- */

/**
 * Enregistrement d'un média déjà déposé dans Storage. Les buckets étant privés,
 * la lecture publique passe par une URL signée générée à la demande.
 */
export async function registerMedia(ctx: ServiceContext, input: RegisterMediaInput) {
  await requirePermission(ctx, "media.create");
  const { data, error } = await ctx.supabase
    .from("media_files")
    .insert({
      bucket_id: input.bucketId,
      storage_path: input.storagePath,
      file_name: input.fileName,
      mime_type: input.mimeType ?? null,
      media_type: input.mediaType,
      size_bytes: input.sizeBytes ?? null,
      width: input.width ?? null,
      height: input.height ?? null,
      alt_text: input.altText ?? null,
      caption: input.caption ?? null,
      folder: input.folder,
      is_public: false,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { mediaId: data.id };
}

export async function signedMediaUrl(
  ctx: ServiceContext,
  mediaId: string,
  expiresIn = 3600,
): Promise<string> {
  const { data: media } = await ctx.supabase
    .from("media_files")
    .select("bucket_id, storage_path")
    .eq("id", mediaId)
    .maybeSingle();
  if (!media) throw notFound("Média");

  const { data, error } = await ctx.supabase.storage
    .from(media.bucket_id)
    .createSignedUrl(media.storage_path, expiresIn);
  if (error || !data) throw error ?? notFound("Média");
  return data.signedUrl;
}