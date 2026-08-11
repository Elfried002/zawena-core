import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { useAdmin } from "@/components/admin/admin-context";
import { DetailRow, PageHeader } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateMyProfileFn } from "@/lib/admin-actions.functions";
import { statusLabel } from "@/components/admin/ui-bits";

export const Route = createFileRoute("/_authenticated/admin/settings/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const admin = useAdmin();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState(admin.fullName ?? "");
  const [jobTitle, setJobTitle] = useState(admin.jobTitle ?? "");
  const [phone, setPhone] = useState("");
  const [locale, setLocale] = useState<"fr" | "en">("fr");

  const save = useMutation({
    mutationFn: () =>
      updateMyProfileFn({
        data: {
          ...(fullName.trim() ? { fullName: fullName.trim() } : {}),
          ...(jobTitle.trim() ? { jobTitle: jobTitle.trim() } : {}),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
          locale,
        },
      }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error("Enregistrement refusé", { description: result.error.message });
        return;
      }
      toast.success("Profil mis à jour");
      void queryClient.invalidateQueries({ queryKey: ["admin-context"] });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Mon profil" description="Vos informations personnelles et votre langue d'interface." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Informations</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-5 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                save.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Fonction</Label>
                <Input id="jobTitle" value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locale">Langue</Label>
                <Select value={locale} onValueChange={(value) => setLocale(value as "fr" | "en")}>
                  <SelectTrigger id="locale">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compte</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border">
              <DetailRow label="E-mail">{admin.email ?? "—"}</DetailRow>
              <DetailRow label="Statut">{statusLabel(admin.accountStatus)}</DetailRow>
              <DetailRow label="Rôles">{admin.roles.join(", ") || "—"}</DetailRow>
              <DetailRow label="Permissions">{admin.permissions.length}</DetailRow>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
