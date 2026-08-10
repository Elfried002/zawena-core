import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";

import { Container } from "@/components/common/layout-primitives";
import { BRAND, FOOTER_COLUMNS } from "@/content/site";
import type { PublicService } from "@/services/public/public.types";

export function Footer({ services = [] }: { services?: PublicService[] }) {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet font-display text-sm font-bold text-primary-foreground">
                Z
              </span>
              <span className="font-display text-lg font-semibold">{BRAND.name}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{BRAND.promise}</p>
            <a
              href={`mailto:${BRAND.email}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              <Mail className="size-4" aria-hidden="true" />
              {BRAND.email}
            </a>
          </div>

          <nav aria-label="Services">
            <h2 className="font-display text-sm font-semibold">Services</h2>
            <ul className="mt-4 space-y-3">
              {services.slice(0, 7).map((service) => (
                <li key={service.slug}>
                  <Link
                    to="/services/$slug"
                    params={{ slug: service.slug }}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="font-display text-sm font-semibold">{column.title}</h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. Tous droits réservés.
          </p>
          <p className="text-xs">
            Les réalisations présentées sont identifiées comme concepts, prototypes ou projets internes.
          </p>
        </div>
      </Container>
    </footer>
  );
}
