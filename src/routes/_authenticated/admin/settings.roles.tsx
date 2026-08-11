import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EmptyState, PageHeader, TableSkeleton } from "@/components/admin/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { rolesOverviewFn } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/settings/roles")({
  component: RolesPage,
});

function RolesPage() {
  const query = useQuery({ queryKey: ["roles-overview"], queryFn: () => rolesOverviewFn() });

  if (query.isPending) return <TableSkeleton rows={5} />;
  if (query.isError || !query.data) {
    return (
      <EmptyState
        title="Matrice indisponible"
        description="La permission users.read est requise pour consulter les rôles."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rôles & permissions"
        description="Matrice de référence appliquée côté serveur. Les rôles sont stockés hors du profil utilisateur."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {query.data.map((entry) => (
          <Card key={entry.role}>
            <CardHeader>
              <CardTitle className="text-base capitalize">{entry.role.replace(/_/g, " ")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {entry.permissions.map((permission) => (
                  <Badge key={permission} variant="secondary" className="border-0 font-mono text-[11px]">
                    {permission}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
