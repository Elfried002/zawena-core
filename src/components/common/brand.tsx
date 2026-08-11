import { Link } from "@tanstack/react-router";

import { BRAND } from "@/content/site";
import { cn } from "@/lib/utils";
import markUrl from "@/assets/zawena-mark-128.png";

/** Marque Zawena : logo officiel + nom, réutilisé navbar / footer. */
export function BrandMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <img
      src={markUrl}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}

export function BrandLockup({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark size={size} />
      <span className="font-display text-lg font-semibold tracking-tight">{BRAND.name}</span>
    </span>
  );
}

export function BrandLink({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <Link to="/" className={cn("group flex items-center", className)} aria-label={`${BRAND.name} — accueil`}>
      <BrandLockup size={size} />
    </Link>
  );
}