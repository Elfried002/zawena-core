/**
 * Contrats de données du site public (client-safe).
 * Ces types définissent EXACTEMENT ce que le navigateur reçoit : aucune donnée
 * interne (CRM, finance, audit, permissions) ne peut y figurer.
 */
import { z } from "zod";

export const capabilitySchema = z.object({
  title: z.string(),
  description: z.string(),
});
export type Capability = z.infer<typeof capabilitySchema>;

export const qaSchema = z.object({ question: z.string(), answer: z.string() });
export type QaItem = z.infer<typeof qaSchema>;

/** Contenu éditorial d'un service, tolérant aux champs absents. */
export const serviceContentSchema = z
  .object({
    eyebrow: z.string().default(""),
    benefit: z.string().default(""),
    problem: z.array(z.string()).default([]),
    solution: z.string().default(""),
    capabilities: z.array(capabilitySchema).default([]),
    useCases: z.array(z.string()).default([]),
    technologies: z.array(z.string()).default([]),
    faq: z.array(qaSchema).default([]),
  })
  .partial()
  .transform((value) => ({
    eyebrow: value.eyebrow ?? "",
    benefit: value.benefit ?? "",
    problem: value.problem ?? [],
    solution: value.solution ?? "",
    capabilities: value.capabilities ?? [],
    useCases: value.useCases ?? [],
    technologies: value.technologies ?? [],
    faq: value.faq ?? [],
  }));
export type ServiceContent = z.infer<typeof serviceContentSchema>;

export interface PublicService {
  slug: string;
  title: string;
  summary: string;
  icon: string;
  seoTitle: string | null;
  seoDescription: string | null;
  isFeatured: boolean;
  content: ServiceContent;
}

export const PROJECT_CATEGORIES = ["AI", "Automation", "Software", "Cybersecurity", "Consulting"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

/** Nature du projet : jamais présenté comme une preuve commerciale client. */
export const PROJECT_KINDS = ["Concept", "Prototype", "Internal Project"] as const;
export type ProjectKind = (typeof PROJECT_KINDS)[number];

export const projectContentSchema = z
  .object({
    kind: z.string().default("Concept"),
    category: z.string().default("AI"),
    challenge: z.string().default(""),
    approach: z.array(z.string()).default([]),
    outcome: z.string().default(""),
    technologies: z.array(z.string()).default([]),
  })
  .partial()
  .transform((value) => ({
    kind: value.kind ?? "Concept",
    category: value.category ?? "AI",
    challenge: value.challenge ?? "",
    approach: value.approach ?? [],
    outcome: value.outcome ?? "",
    technologies: value.technologies ?? [],
  }));
export type ProjectContent = z.infer<typeof projectContentSchema>;

export interface PublicProject {
  slug: string;
  title: string;
  summary: string;
  industry: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isFeatured: boolean;
  content: ProjectContent;
}

export interface PublicFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface PublicTechnology {
  name: string;
  category: string | null;
}
