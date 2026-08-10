/** Empreinte réseau du visiteur (serveur uniquement), utilisée pour le rate limiting. */
import { getRequest } from "@tanstack/react-start/server";

export function ipHashFromRequest(): string | undefined {
  try {
    const forwarded = getRequest().headers.get("x-forwarded-for");
    const first = forwarded?.split(",")[0]?.trim();
    return first && first.length > 0 ? first : undefined;
  } catch {
    return undefined;
  }
}
