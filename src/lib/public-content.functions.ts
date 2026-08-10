/**
 * Server functions de lecture publique.
 * Elles n'exigent aucune authentification et sont donc appelables depuis les
 * loaders des routes publiques (SSR / prerender inclus).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const slugSchema = z.object({ slug: z.string().trim().min(1).max(160) });
const categorySchema = z.object({ category: z.string().trim().max(60).optional() });

export const getPublishedServicesFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublishedServices } = await import("@/services/public/public.server");
  return getPublishedServices();
});

export const getPublishedServiceFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => slugSchema.parse(data))
  .handler(async ({ data }) => {
    const { getPublishedService } = await import("@/services/public/public.server");
    return getPublishedService(data.slug);
  });

export const getPublishedProjectsFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => categorySchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const { getPublishedProjects } = await import("@/services/public/public.server");
    return getPublishedProjects(data.category ? { category: data.category } : {});
  });

export const getPublishedProjectFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => slugSchema.parse(data))
  .handler(async ({ data }) => {
    const { getPublishedProject } = await import("@/services/public/public.server");
    return getPublishedProject(data.slug);
  });

export const getPublishedFaqFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => categorySchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const { getPublishedFaq } = await import("@/services/public/public.server");
    return getPublishedFaq(data.category);
  });

export const getHomeContentFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublishedServices, getPublishedProjects, getPublishedFaq } = await import(
    "@/services/public/public.server"
  );
  const [services, projects, faqs] = await Promise.all([
    getPublishedServices(),
    getPublishedProjects(),
    getPublishedFaq(),
  ]);
  return { services, projects: projects.slice(0, 3), faqs: faqs.slice(0, 6) };
});
