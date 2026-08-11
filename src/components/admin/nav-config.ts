import {
  Activity,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  CheckSquare,
  FileText,
  FolderKanban,
  HelpCircle,
  Image,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Newspaper,
  Receipt,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  UserSquare2,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Permission } from "@/services/core/permissions";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Permission requise pour voir l'entrée (l'accès reste vérifié côté serveur). */
  permission?: Permission;
  exact?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const ADMIN_NAV: NavGroup[] = [
  {
    label: "Pilotage",
    items: [
      { label: "Tableau de bord", to: "/admin", icon: LayoutDashboard, exact: true },
      { label: "Analytics", to: "/admin/analytics", icon: BarChart3, permission: "analytics.read" },
      { label: "Notifications", to: "/admin/notifications", icon: Bell },
    ],
  },
  {
    label: "CRM",
    items: [
      { label: "Prospects", to: "/admin/crm/leads", icon: Target, permission: "leads.read" },
      { label: "Entreprises", to: "/admin/crm/companies", icon: Building2, permission: "companies.read" },
      { label: "Contacts", to: "/admin/crm/contacts", icon: UserSquare2, permission: "contacts.read" },
      { label: "Activités", to: "/admin/crm/activities", icon: Activity, permission: "activities.read" },
      { label: "Tâches", to: "/admin/crm/tasks", icon: CheckSquare, permission: "tasks.read" },
    ],
  },
  {
    label: "Commercial",
    items: [
      { label: "Pipeline", to: "/admin/sales/pipeline", icon: FolderKanban, permission: "opportunities.read" },
      { label: "Demandes de devis", to: "/admin/sales/requests", icon: Inbox, permission: "quote_requests.read" },
      { label: "Devis", to: "/admin/sales/quotes", icon: Briefcase, permission: "quotes.read" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Factures", to: "/admin/finance/invoices", icon: Receipt, permission: "invoices.read" },
      { label: "Paiements", to: "/admin/finance/payments", icon: Wallet, permission: "payments.read" },
    ],
  },
  {
    label: "Support",
    items: [{ label: "Tickets", to: "/admin/support/tickets", icon: LifeBuoy, permission: "tickets.read" }],
  },
  {
    label: "Contenus",
    items: [
      { label: "Pages", to: "/admin/content/pages", icon: FileText, permission: "pages.read" },
      { label: "Services", to: "/admin/content/services", icon: Sparkles, permission: "services.read" },
      { label: "Réalisations", to: "/admin/content/projects", icon: FolderKanban, permission: "projects.read" },
      { label: "Blog", to: "/admin/content/blog", icon: Newspaper, permission: "blog_posts.read" },
      { label: "FAQ", to: "/admin/content/faqs", icon: HelpCircle, permission: "faqs.read" },
      { label: "Médias", to: "/admin/content/media", icon: Image, permission: "media.read" },
    ],
  },
  {
    label: "Réglages",
    items: [
      { label: "Mon profil", to: "/admin/settings/profile", icon: Settings },
      { label: "Utilisateurs", to: "/admin/settings/users", icon: Users, permission: "users.read" },
      { label: "Rôles & permissions", to: "/admin/settings/roles", icon: ShieldCheck, permission: "users.read" },
    ],
  },
];
