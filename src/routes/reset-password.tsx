import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { BrandLockup } from "@/components/common/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Zawena — Nouveau mot de passe" },
      { name: "description", content: "Définissez un nouveau mot de passe pour votre compte Zawena." },
      { property: "og:title", content: "Zawena — Nouveau mot de passe" },
      { property: "og:description", content: "Définition d'un nouveau mot de passe." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (error) {
      toast.error("Mise à jour impossible", { description: error.message });
      return;
    }
    toast.success("Mot de passe mis à jour");
    void navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-5 py-16">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-sm"
      >
        <BrandLockup />
        <h1 className="mt-6 font-display text-2xl font-semibold">Nouveau mot de passe</h1>
        <div className="mt-6 space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <Button type="submit" className="mt-6 w-full rounded-full" disabled={pending}>
          {pending ? "Mise à jour…" : "Enregistrer"}
        </Button>
      </form>
    </div>
  );
}
