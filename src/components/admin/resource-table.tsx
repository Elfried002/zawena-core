import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";

import { EmptyState, TableSkeleton } from "./ui-bits";
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
import { adminListFn } from "@/lib/admin.functions";
import type { AdminResource, AdminRow } from "@/services/admin/admin-resources";

export interface ColumnDef {
  key: string;
  header: string;
  render?: (row: AdminRow) => ReactNode;
  className?: string;
}

export interface FilterDef {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

export interface ResourceTableProps {
  resource: AdminResource;
  columns: ColumnDef[];
  filters?: FilterDef[];
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Construit le lien de la fiche détaillée à partir de la ligne. */
  rowTo?: (row: AdminRow) => string | null;
  pageSize?: number;
}

export function ResourceTable({
  resource,
  columns,
  filters = [],
  searchPlaceholder = "Rechercher…",
  emptyTitle = "Aucun résultat",
  emptyDescription = "Ajustez la recherche ou les filtres pour élargir la liste.",
  rowTo,
  pageSize = 25,
}: ResourceTableProps) {
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<Record<string, string>>({});

  const params = useMemo(
    () => ({ resource, page, pageSize, sortDir: "desc" as const, search: term, filters: active }),
    [resource, page, pageSize, term, active],
  );

  const query = useQuery({
    queryKey: ["admin-list", params],
    queryFn: () => adminListFn({ data: params }),
    placeholderData: keepPreviousData,
  });

  function applySearch(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setTerm(search.trim());
  }

  function setFilter(key: string, value: string) {
    setPage(1);
    setActive((current) => {
      const next = { ...current };
      if (value === "__all") delete next[key];
      else next[key] = value;
      return next;
    });
  }

  const rows = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={applySearch} className="flex flex-1 gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="max-w-xs"
            aria-label="Recherche"
          />
          <Button type="submit" variant="secondary">
            Rechercher
          </Button>
        </form>
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={active[filter.key] ?? "__all"}
            onValueChange={(value) => setFilter(filter.key, value)}
          >
            <SelectTrigger className="w-full sm:w-48" aria-label={filter.label}>
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">{filter.label} : tous</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      {query.isPending ? (
        <TableSkeleton />
      ) : query.isError ? (
        <EmptyState
          title="Données indisponibles"
          description="Vous n'avez peut-être pas les droits nécessaires, ou le service est momentanément indisponible."
        />
      ) : rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key} className={column.className}>
                      {column.header}
                    </TableHead>
                  ))}
                  {rowTo && <TableHead className="w-24" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => {
                  const href = rowTo?.(row) ?? null;
                  return (
                    <TableRow key={String(row["id"] ?? index)}>
                      {columns.map((column) => (
                        <TableCell key={column.key} className={column.className}>
                          {column.render ? column.render(row) : (renderPlain(row[column.key]) as ReactNode)}
                        </TableCell>
                      ))}
                      {rowTo && (
                        <TableCell className="text-right">
                          {href && (
                            <Button asChild size="sm" variant="ghost">
                              <Link to={href as never}>Ouvrir</Link>
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total} résultat{total > 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1 || query.isFetching}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Précédent
          </Button>
          <span className="tabular-nums">
            {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages || query.isFetching}
            onClick={() => setPage((value) => value + 1)}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}

function renderPlain(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (typeof value === "object") return "—";
  return String(value);
}
