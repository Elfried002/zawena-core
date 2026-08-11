import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { useCan } from "@/components/admin/admin-context";
import { EmptyState, PageHeader, StatusBadge, TableSkeleton, formatDate } from "@/components/admin/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usersOverviewFn } from "@/lib/admin.functions";
import { setUserRoleFn, setUserStatusFn } from "@/lib/admin-actions.functions";
import { APP_ROLES } from "@/services/core/permissions";

export const Route = createFileRoute("/_authenticated/admin/settings/users")({
  component: UsersPage,
});

const STATUSES = ["active", "suspended", "deactivated"] as const;

function UsersPage() {
  const can = useCan();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["users-overview", page, term],
    queryFn: () => usersOverviewFn({ data: { page, ...(term ? { search: term } : {}) } }),
    placeholderData: keepPreviousData,
  });

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["users-overview"] });
  }

  const setStatus = useMutation({
    mutationFn: (input: { userId: string; status: (typeof STATUSES)[number] }) =>
      setUserStatusFn({ data: input }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error("Action refusée", { description: result.error.message });
        return;
      }
      toast.success("Statut du compte mis à jour");
      refresh();
    },
  });

  const setRole = useMutation({
    mutationFn: (input: { userId: string; role: (typeof APP_ROLES)[number]; grant: boolean }) =>
      setUserRoleFn({ data: input }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error("Action refusée", { description: result.error.message });
        return;
      }
      toast.success("Rôles mis à jour");
      refresh();
    },
  });

  const users = query.data?.users.items ?? [];
  const roles = query.data?.roles ?? {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs"
        description="Comptes internes, statut d'accès et rôles. Toute modification est auditée."
      />

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setTerm(search.trim());
        }}
      >
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nom ou e-mail…"
          className="max-w-xs"
          aria-label="Recherche utilisateur"
        />
        <Button type="submit" variant="secondary">
          Rechercher
        </Button>
      </form>

      {query.isPending ? (
        <TableSkeleton />
      ) : users.length === 0 ? (
        <EmptyState title="Aucun utilisateur" description="Aucun compte ne correspond à cette recherche." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Rôles</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="w-72" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const userId = String(user["id"]);
                  const userRoles = roles[userId] ?? [];
                  return (
                    <TableRow key={userId}>
                      <TableCell>
                        <p className="font-medium">{String(user["full_name"] ?? "—")}</p>
                        <p className="text-xs text-muted-foreground">{String(user["email"] ?? "—")}</p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={user["status"]} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {userRoles.length === 0 ? (
                            <span className="text-sm text-muted-foreground">—</span>
                          ) : (
                            userRoles.map((role) => (
                              <Badge key={role} variant="secondary" className="border-0">
                                {role}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(user["created_at"])}</TableCell>
                      <TableCell>
                        {can("users.update") ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <Select
                              value=""
                              onValueChange={(value) =>
                                setStatus.mutate({
                                  userId,
                                  status: value as (typeof STATUSES)[number],
                                })
                              }
                            >
                              <SelectTrigger className="w-36" aria-label="Changer le statut">
                                <SelectValue placeholder="Statut" />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUSES.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value=""
                              onValueChange={(value) => {
                                const role = value as (typeof APP_ROLES)[number];
                                setRole.mutate({ userId, role, grant: !userRoles.includes(role) });
                              }}
                            >
                              <SelectTrigger className="w-40" aria-label="Basculer un rôle">
                                <SelectValue placeholder="Rôle (basculer)" />
                              </SelectTrigger>
                              <SelectContent>
                                {APP_ROLES.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {userRoles.includes(role) ? `Retirer ${role}` : `Ajouter ${role}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Lecture seule</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
          Précédent
        </Button>
        <span className="tabular-nums">
          {page} / {query.data?.users.totalPages ?? 1}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= (query.data?.users.totalPages ?? 1)}
          onClick={() => setPage((value) => value + 1)}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
