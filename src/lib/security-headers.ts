/**
 * En-têtes de sécurité HTTP appliqués à toutes les réponses.
 * La CSP autorise strictement ce dont Zawena a besoin : Supabase (API/Storage),
 * Google Fonts, images distantes en HTTPS et les scripts de l'application.
 */
const SUPABASE_ORIGIN = "https://uidqposicigcymdwiarj.supabase.co";

function buildCsp(): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'self' https://lovable.dev https://*.lovable.app https://*.lovableproject.com",
    // Le SSR de TanStack Start injecte des scripts d'hydratation inline.
    "script-src 'self' 'unsafe-inline' https://lovable.dev https://*.lovable.app",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    `connect-src 'self' ${SUPABASE_ORIGIN} wss://uidqposicigcymdwiarj.supabase.co https://lovable.dev https://*.lovable.app`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  const contentType = headers.get("content-type") ?? "";

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  // La CSP n'a de sens que sur les documents HTML.
  if (contentType.includes("text/html")) {
    headers.set("Content-Security-Policy", buildCsp());
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}