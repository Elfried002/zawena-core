/** Détection du pays du visiteur (serveur uniquement, best-effort). */
import { getRequest } from "@tanstack/react-start/server";

const COUNTRY_HEADERS = [
  "cf-ipcountry",
  "x-vercel-ip-country",
  "x-country-code",
  "x-geo-country",
] as const;

export function countryFromRequest(): string | null {
  try {
    const headers = getRequest().headers;
    for (const name of COUNTRY_HEADERS) {
      const value = headers.get(name);
      if (value && value.length === 2 && value.toUpperCase() !== "XX") return value.toUpperCase();
    }
    const language = headers.get("accept-language");
    const region = language?.split(",")[0]?.split("-")[1];
    return region && region.length === 2 ? region.toUpperCase() : null;
  } catch {
    return null;
  }
}
