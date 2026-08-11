/** Ressources back-office (client-safe : utilisé par les schémas et l'UI). */
export const ADMIN_RESOURCES = [
  "leads",
  "companies",
  "contacts",
  "opportunities",
  "activities",
  "tasks",
  "quote_requests",
  "quotes",
  "invoices",
  "payments",
  "tickets",
  "pages",
  "services",
  "projects",
  "blog_posts",
  "faqs",
  "media_files",
  "users",
  "notifications",
] as const;

export type AdminResource = (typeof ADMIN_RESOURCES)[number];

/** Ligne générique renvoyée par les listes admin (projection explicite côté serveur). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AdminRow = Record<string, any>;
