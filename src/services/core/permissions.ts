/**
 * Catalogue des permissions par action (client-safe).
 * La source de vérité reste la table `role_permissions` + `has_permission()` en base :
 * ces constantes servent uniquement à éviter les fautes de frappe.
 */
export const PERMISSIONS = {
  pages: ["pages.read", "pages.create", "pages.update", "pages.delete"],
  services: ["services.read", "services.create", "services.update"],
  projects: ["projects.read", "projects.create", "projects.update"],
  blog: ["blog.read", "blog.create", "blog.update", "blog.publish"],
  faqs: ["faqs.read", "faqs.create", "faqs.update", "faqs.delete"],
  technologies: ["technologies.read", "technologies.update"],
  navigation: ["navigation.read", "navigation.update"],
  media: ["media.read", "media.create", "media.update"],
  leads: ["leads.read", "leads.create", "leads.update"],
  contacts: ["contacts.read", "contacts.create", "contacts.update"],
  companies: ["companies.read", "companies.create", "companies.update"],
  opportunities: ["opportunities.read", "opportunities.create", "opportunities.update"],
  activities: ["activities.read", "activities.create"],
  tasks: ["tasks.read", "tasks.create", "tasks.update"],
  quoteRequests: ["quote_requests.read", "quote_requests.update"],
  quotes: ["quotes.read", "quotes.create", "quotes.update", "quotes.send"],
  invoices: ["invoices.read", "invoices.create", "invoices.update", "invoices.send"],
  payments: ["payments.read", "payments.create"],
  tickets: ["tickets.read", "tickets.create", "tickets.update", "tickets.assign", "tickets.close"],
  ticketReplies: ["ticket_replies.read", "ticket_replies.create"],
  users: ["users.read", "users.invite", "users.update", "users.roles.manage"],
  settings: ["settings.read", "settings.update"],
  analytics: ["analytics.read"],
} as const;

export type Permission =
  | (typeof PERMISSIONS)[keyof typeof PERMISSIONS][number]
  | "users.read"
  | "users.invite"
  | "users.update"
  | "users.roles.manage"
  | "settings.update";

export const APP_ROLES = [
  "super_admin",
  "admin",
  "editor",
  "sales",
  "support",
  "finance",
  "viewer",
  "client",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

/** Rôles composant le back-office (le rôle `client` est réservé au futur portail). */
export const STAFF_ROLES: AppRole[] = [
  "super_admin",
  "admin",
  "editor",
  "sales",
  "support",
  "finance",
  "viewer",
];