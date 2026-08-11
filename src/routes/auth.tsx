import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { BrandLockup } from "@/components/common/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Espace Zawena — Connexion" },
      {
        name: "description",
        content: "Connexion à l'espace opérationnel Zawena : CRM, devis, finance, support et contenus.",
      },
      { property: "og:title", content: "Espace Zawena — Connexion" },
      { property: "og:description", content: "Accès réservé aux équipes Zawena." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "reset";

function AuthPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) void navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Lien de réinitialisation envoyé", {
          description: "Vérifiez votre boîte de réception.",
        });
        setMode("signin");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await router.invalidate();
      void navigate({ to: "/admin", replace: true });
    } catch (error) {
      toast.error("Connexion impossible", {
        description: error instanceof Error ? error.message : "Vérifiez vos identifiants.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-5 py-16">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-sm">
        <BrandLockup />
        <h1 className="mt-6 font-display text-2xl font-semibold">Espace opérationnel</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Accès réservé aux équipes Zawena."
            : "Recevez un lien pour définir un nouveau mot de passe."}
        </p>

        <form className="mt-7 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          {mode === "signin" && (
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          )}

          <Button type="submit" className="w-full rounded-full" disabled={pending}>
            {pending ? "Veuillez patienter…" : mode === "signin" ? "Se connecter" : "Envoyer le lien"}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs">
          <button
            type="button"
            className="text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => setMode(mode === "signin" ? "reset" : "signin")}
          >
            {mode === "signin" ? "Mot de passe oublié ?" : "Retour à la connexion"}
          </button>
          <Link to="/" className="text-muted-foreground underline-offset-4 hover:underline">
            Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}
