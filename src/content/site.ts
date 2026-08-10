/**
 * Constantes éditoriales du site public.
 * Contenu de marque uniquement : aucune donnée métier (services, réalisations,
 * FAQ) n'est codée en dur ici — elle provient du CMS.
 */
import {
  Bot,
  Code2,
  Compass,
  LayoutDashboard,
  Plug,
  ShieldCheck,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export const BRAND = {
  name: "Zawena",
  tagline: "IA • Automatisation • Ingénierie",
  promise:
    "Zawena conçoit, intègre, automatise et sécurise des solutions technologiques intelligentes pour les entreprises.",
  email: "contact@zawena.com",
} as const;

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  bot: Bot,
  workflow: Workflow,
  plug: Plug,
  "layout-dashboard": LayoutDashboard,
  "code-2": Code2,
  "shield-check": ShieldCheck,
  compass: Compass,
  sparkles: Sparkles,
};

export function serviceIcon(name: string): LucideIcon {
  return SERVICE_ICONS[name] ?? Sparkles;
}

export const PROBLEMS = [
  {
    title: "Processus manuels",
    description: "Des heures passées chaque semaine sur des tâches que personne ne devrait faire à la main.",
  },
  {
    title: "Outils isolés",
    description: "CRM, ERP, support et tableurs qui ne se parlent pas et se contredisent.",
  },
  {
    title: "Données dispersées",
    description: "L'information existe, mais elle est introuvable au moment de décider.",
  },
  {
    title: "Logiciels vieillissants",
    description: "Des applications que plus personne n'ose modifier sans risque.",
  },
  {
    title: "Risques de sécurité",
    description: "Des accès accumulés, des dépendances non suivies, aucune priorisation.",
  },
  {
    title: "IA difficile à intégrer",
    description: "Des expérimentations prometteuses qui n'atteignent jamais la production.",
  },
] as const;

export const DIFFERENTIATORS = [
  {
    title: "Business-first",
    description: "Nous partons du problème métier et de sa valeur, jamais de la technologie disponible.",
  },
  {
    title: "Engineering-driven",
    description: "Architecture explicite, règles côté serveur, code maintenable et documenté.",
  },
  {
    title: "AI-native",
    description: "L'IA est intégrée là où elle fait gagner du temps, et écartée partout ailleurs.",
  },
  {
    title: "Security-conscious",
    description: "Moindre privilège, validation systématique et traçabilité dès la conception.",
  },
  {
    title: "Scalable",
    description: "Des systèmes conçus pour absorber la croissance sans réécriture.",
  },
  {
    title: "Human expertise",
    description: "Des décisions techniques prises par des humains, avec vous, et expliquées.",
  },
] as const;

export const PROCESS_STEPS = [
  { step: "01", title: "Discovery", description: "Comprendre le processus, les contraintes et la valeur attendue." },
  { step: "02", title: "Strategy", description: "Prioriser les cas d'usage selon valeur, effort et risque." },
  { step: "03", title: "Architecture", description: "Définir données, intégrations et frontières du système." },
  { step: "04", title: "Build", description: "Construire par itérations livrables et vérifiables." },
  { step: "05", title: "Test", description: "Valider fonctionnellement, techniquement et côté sécurité." },
  { step: "06", title: "Deploy", description: "Mettre en production avec observabilité et plan de retour." },
  { step: "07", title: "Improve", description: "Mesurer l'usage réel et améliorer en continu." },
] as const;

export const CAPABILITY_DOMAINS = [
  "AI Agents",
  "Automatisation de workflows",
  "Intégration LLM & APIs",
  "Applications métier",
  "Architecture logicielle",
  "Audit de sécurité",
  "Modélisation de données",
  "Conseil et cadrage IA",
] as const;

export const NAV_LINKS = [
  { label: "Services", to: "/services" },
  { label: "Réalisations", to: "/portfolio" },
  { label: "À propos", to: "/about" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
] as const;

export const FOOTER_COLUMNS = [
  {
    title: "Entreprise",
    links: [
      { label: "À propos", to: "/about" },
      { label: "Réalisations", to: "/portfolio" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "FAQ", to: "/faq" },
      { label: "Demander un devis", to: "/quote" },
      { label: "Tous les services", to: "/services" },
    ],
  },
] as const;
