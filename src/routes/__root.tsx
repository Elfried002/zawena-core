import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { getPublishedServicesFn } from "@/lib/public-content.functions";
import type { PublicService } from "@/services/public/public.types";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Zawena — IA, automatisation, ingénierie logicielle et cybersécurité" },
      {
        name: "description",
        content:
          "Zawena conçoit, intègre, automatise et sécurise des solutions technologiques intelligentes pour les entreprises.",
      },
      { name: "author", content: "Zawena" },
      { property: "og:site_name", content: "Zawena" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#ffffff" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Zawena",
          url: "https://zawena.com",
          description:
            "Entreprise technologique B2B spécialisée en IA, automatisation, ingénierie logicielle et cybersécurité.",
          email: "contact@zawena.com",
          knowsAbout: [
            "AI Agents",
            "AI Automation",
            "AI Integration",
            "AI Applications",
            "Software Engineering",
            "Cybersecurity",
            "AI Consulting",
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Zawena",
          url: "https://zawena.com",
          inLanguage: "fr",
        }),
      },
    ],
  }),
  loader: async (): Promise<{ services: PublicService[] }> => {
    try {
      return { services: await getPublishedServicesFn() };
    } catch (error) {
      console.error("[root] services indisponibles", error);
      return { services: [] };
    }
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function SiteChrome({ children }: { children: ReactNode }) {
  const data = Route.useLoaderData();
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Aller au contenu principal
      </a>
      <Navbar />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <Footer services={data?.services ?? []} />
      <Toaster />
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SiteChrome>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </SiteChrome>
    </QueryClientProvider>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Erreur 404</p>
      <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">Cette page n'existe pas</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Le lien est peut-être obsolète ou la page a été déplacée. Voici deux points de départ utiles.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="rounded-full">
          <Link to="/">Retour à l'accueil</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <Link to="/services">Voir nos services</Link>
        </Button>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-24 text-center">
      <h1 className="text-2xl font-semibold">Une erreur est survenue</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Veuillez réessayer dans quelques instants. Si le problème persiste, écrivez-nous à contact@zawena.com.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="rounded-full"
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          Réessayer
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <a href="/">Retour à l'accueil</a>
        </Button>
      </div>
    </div>
  );
}
