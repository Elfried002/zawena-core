/**
 * Recherche, filtres, tri et pagination (client-safe).
 */
import { z } from "zod";

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 25;

export const listParamsSchema = z.object({
  search: z.string().trim().max(120).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  sortBy: z.string().trim().max(60).optional(),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type ListParams = z.infer<typeof listParamsSchema>;

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function rangeFor(params: Pick<ListParams, "page" | "pageSize">): [number, number] {
  const start = (params.page - 1) * params.pageSize;
  return [start, start + params.pageSize - 1];
}

export function paginate<T>(items: T[], total: number, params: ListParams): Paginated<T> {
  return {
    items,
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
  };
}

/** Échappe les caractères spéciaux d'un motif `ilike` PostgREST. */
export function likePattern(search: string): string {
  return `%${search.replace(/[%_,()]/g, (c) => `\\${c}`)}%`;
}