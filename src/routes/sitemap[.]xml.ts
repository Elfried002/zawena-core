/**
 * Sitemap public. N'expose que du contenu CMS publié (services, réalisations)
 * et les routes publiques statiques. Aucune route interne, CRM, finance,
 * support ni contenu draft/review/archived n'y figure.
 */
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://zawena.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const STATIC_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/services", changefreq: "weekly", priority: "0.9" },
  { path: "/portfolio", changefreq: "weekly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/faq", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/quote", changefreq: "monthly", priority: "0.7" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { getPublishedServices, getPublishedProjects } = await import(
          "@/services/public/public.server"
        );

        const entries: SitemapEntry[] = [...STATIC_ENTRIES];

        try {
          const [services, projects] = await Promise.all([
            getPublishedServices(),
            getPublishedProjects(),
          ]);
          for (const service of services) {
            entries.push({ path: `/services/${service.slug}`, changefreq: "monthly", priority: "0.8" });
          }
          for (const project of projects) {
            entries.push({ path: `/portfolio/${project.slug}`, changefreq: "monthly", priority: "0.6" });
          }
        } catch (error) {
          console.error("[sitemap] contenu CMS indisponible", error);
        }

        const urls = entries.map((entry) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${entry.path}</loc>`,
            entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : null,
            entry.priority ? `    <priority>${entry.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
