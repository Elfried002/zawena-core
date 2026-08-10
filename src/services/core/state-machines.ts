/**
 * Machines à états métier (client-safe).
 * Toute transition est vérifiée côté serveur avant écriture : un statut ne peut
 * jamais être « sauté » ou forcé depuis le frontend.
 */
import { invalidState } from "./errors";

export type Transitions<S extends string> = Readonly<Record<S, readonly S[]>>;

export type ContentStatus = "draft" | "scheduled" | "published" | "archived";
export const contentTransitions: Transitions<ContentStatus> = {
  draft: ["scheduled", "published", "archived"],
  scheduled: ["draft", "published", "archived"],
  published: ["draft", "archived"],
  archived: ["draft"],
};

export type LeadStatus = "new" | "contacted" | "qualified" | "unqualified" | "converted";
export const leadTransitions: Transitions<LeadStatus> = {
  new: ["contacted", "unqualified"],
  contacted: ["qualified", "unqualified"],
  qualified: ["converted", "unqualified"],
  unqualified: ["contacted"],
  converted: [],
};

export type QuoteRequestStatus =
  | "new"
  | "reviewing"
  | "qualified"
  | "quote_created"
  | "quoted"
  | "declined"
  | "archived";
export const quoteRequestTransitions: Transitions<QuoteRequestStatus> = {
  new: ["reviewing", "declined"],
  reviewing: ["qualified", "declined"],
  qualified: ["quote_created", "declined"],
  quote_created: ["quoted", "declined"],
  quoted: ["archived", "declined"],
  declined: ["archived"],
  archived: [],
};

export type QuoteStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired"
  | "cancelled";
export const quoteTransitions: Transitions<QuoteStatus> = {
  draft: ["sent", "cancelled"],
  sent: ["viewed", "accepted", "rejected", "expired", "cancelled"],
  viewed: ["accepted", "rejected", "expired", "cancelled"],
  accepted: [],
  rejected: ["cancelled"],
  expired: ["cancelled"],
  cancelled: [],
};

/** Un devis figé ne peut plus être modifié : il faut créer une révision. */
export const QUOTE_IMMUTABLE_STATUSES: QuoteStatus[] = [
  "sent",
  "viewed",
  "accepted",
  "rejected",
  "expired",
  "cancelled",
];

export type InvoiceStatus =
  | "draft"
  | "issued"
  | "sent"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled"
  | "void";
export const invoiceTransitions: Transitions<InvoiceStatus> = {
  draft: ["issued", "cancelled"],
  issued: ["sent", "cancelled"],
  sent: ["partially_paid", "paid", "overdue", "cancelled"],
  partially_paid: ["paid", "overdue", "cancelled"],
  overdue: ["partially_paid", "paid", "cancelled"],
  paid: [],
  cancelled: [],
  void: [],
};

export type TicketStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "waiting_customer"
  | "pending"
  | "resolved"
  | "closed";
export const ticketTransitions: Transitions<TicketStatus> = {
  open: ["assigned", "in_progress", "pending", "resolved", "closed"],
  assigned: ["in_progress", "waiting_customer", "pending", "resolved"],
  in_progress: ["waiting_customer", "pending", "resolved"],
  waiting_customer: ["in_progress", "resolved", "closed"],
  pending: ["in_progress", "resolved", "closed"],
  resolved: ["closed", "in_progress"],
  closed: ["open"], // réouverture explicite
};

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export const taskTransitions: Transitions<TaskStatus> = {
  todo: ["in_progress", "cancelled"],
  in_progress: ["done", "cancelled", "todo"],
  done: ["in_progress"],
  cancelled: ["todo"],
};

export type UserAccountStatus = "invited" | "active" | "suspended" | "deactivated";
export const userStatusTransitions: Transitions<UserAccountStatus> = {
  invited: ["active", "deactivated"],
  active: ["suspended", "deactivated"],
  suspended: ["active", "deactivated"],
  deactivated: [],
};

export function canTransition<S extends string>(map: Transitions<S>, from: S, to: S): boolean {
  if (from === to) return true;
  return (map[from] ?? []).includes(to);
}

/** Lève une erreur métier INVALID_STATE si la transition est interdite. */
export function assertTransition<S extends string>(
  map: Transitions<S>,
  from: S,
  to: S,
  label: string,
): void {
  if (!canTransition(map, from, to)) {
    throw invalidState(`Transition ${label} interdite : ${from} → ${to}`, { from, to });
  }
}