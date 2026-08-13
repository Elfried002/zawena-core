/**
 * Validations du module CMS (client-safe).
 */
import { z } from "zod";

export const CMS_ENTITIES = ["pages", "services", "projects", "blog_posts", "faqs"] as const;
export type CmsEntity = (typeof CMS_ENTITIES)[number];

/**
 * Types de fichiers acceptés pour les médias. Aucun SVG ni HTML : ces formats
 * peuvent embarquer du script exécutable servi depuis notre domaine.
 */
export const ALLOWED_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
  "video/mp4",
  "audio/mpeg",
] as const;

/** Plafond de taille appliqué côté serveur (25 Mo). */
export const MAX_MEDIA_SIZE_BYTES = 25 * 1024 * 1024;

export const contentStatusSchema = z.enum([
  "draft",
  "review",
  "scheduled",
  "published",
  "archived",
]);

export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (minuscules, chiffres et tirets)");

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export const seoSchema = z.object({
  seoTitle: z.string().trim().max(60).optional(),
  seoDescription: z.string().trim().max(160).optional(),
  seoKeywords: z.array(z.string().trim().max(60)).max(20).optional(),
  ogImageUrl: z.string().trim().url().max(500).optional(),
  noindex: z.boolean().optional(),
});
export type SeoInput = z.infer<typeof seoSchema>;

/** Contenu structuré (blocs) : jamais du HTML brut fourni par l'utilisateur. */
export const contentBlocksSchema = z.record(z.unknown()).default({});

export const pageSchema = seoSchema.extend({
  slug: slugSchema.optional(),
  title: z.string().trim().min(2).max(200),
  excerpt: z.string().trim().max(500).optional(),
  content: contentBlocksSchema,
  coverMediaId: z.string().uuid().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});
export type PageInput = z.infer<typeof pageSchema>;

export const serviceSchema = seoSchema.extend({
  slug: slugSchema.optional(),
  title: z.string().trim().min(2).max(200),
  summary: z.string().trim().max(500).optional(),
  content: contentBlocksSchema,
  icon: z.string().trim().max(60).optional(),
  coverMediaId: z.string().uuid().optional(),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  technologyIds: z.array(z.string().uuid()).max(50).default([]),
});
export type ServiceInput = z.infer<typeof serviceSchema>;

export const projectSchema = seoSchema.extend({
  slug: slugSchema.optional(),
  title: z.string().trim().min(2).max(200),
  /**
   * Nom du client : uniquement une référence réelle et autorisée.
   * Une réalisation de démonstration doit porter `isDemo: true`.
   */
  clientName: z.string().trim().max(160).optional(),
  industry: z.string().trim().max(120).optional(),
  summary: z.string().trim().max(1000).optional(),
  content: contentBlocksSchema,
  coverMediaId: z.string().uuid().optional(),
  externalUrl: z.string().trim().url().max(500).optional(),
  deliveredAt: z.string().date().optional(),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  technologyIds: z.array(z.string().uuid()).max(50).default([]),
  /** Marque explicitement un contenu d'exemple (jamais présenté comme réel). */
  isDemo: z.boolean().default(false),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const blogPostSchema = seoSchema.extend({
  slug: slugSchema.optional(),
  title: z.string().trim().min(2).max(200),
  excerpt: z.string().trim().max(500).optional(),
  content: contentBlocksSchema,
  categoryId: z.string().uuid().optional(),
  coverMediaId: z.string().uuid().optional(),
  authorId: z.string().uuid().optional(),
  readingMinutes: z.number().int().min(1).max(180).optional(),
  tagIds: z.array(z.string().uuid()).max(20).default([]),
});
export type BlogPostInput = z.infer<typeof blogPostSchema>;

export const faqSchema = z.object({
  question: z.string().trim().min(5).max(300),
  answer: z.string().trim().min(5).max(4000),
  category: z.string().trim().max(80).default("general"),
  serviceId: z.string().uuid().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});
export type FaqInput = z.infer<typeof faqSchema>;

export const publishSchema = z.object({
  entity: z.enum(CMS_ENTITIES),
  id: z.string().uuid(),
  status: contentStatusSchema,
  publishAt: z.string().datetime().optional(),
});

export const registerMediaSchema = z.object({
  bucketId: z.enum(["public-images", "blog", "portfolio", "documents", "avatars", "logos"]),
  storagePath: z.string().trim().min(3).max(500),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.enum(ALLOWED_MEDIA_MIME_TYPES).optional(),
  mediaType: z.enum(["image", "document", "video", "audio", "other"]).default("image"),
  sizeBytes: z
    .number()
    .int()
    .nonnegative()
    .max(MAX_MEDIA_SIZE_BYTES, "Fichier trop volumineux (25 Mo maximum)")
    .optional(),
  width: z.number().int().positive().max(20000).optional(),
  height: z.number().int().positive().max(20000).optional(),
  altText: z.string().trim().max(300).optional(),
  caption: z.string().trim().max(500).optional(),
  folder: z.string().trim().max(120).default("/"),
});
export type RegisterMediaInput = z.infer<typeof registerMediaSchema>;