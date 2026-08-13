import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { useCan } from "@/components/admin/admin-context";
import {
  EmptyState,
  PageHeader,
  TableSkeleton,
  formatBytes,
  formatDateTime,
} from "@/components/admin/ui-bits";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminListFn } from "@/lib/admin.functions";
import {
  deleteMediaFn,
  mediaUploadUrlFn,
  registerMediaFn,
  signedMediaUrlFn,
} from "@/lib/admin-actions.functions";

export const Route = createFileRoute("/_authenticated/admin/content/media")({
  component: MediaPage,
});

const BUCKETS = ["public-images", "blog", "portfolio", "documents", "avatars", "logos"] as const;
type Bucket = (typeof BUCKETS)[number];

function mediaTypeOf(file: File): "image" | "document" | "video" | "audio" | "other" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.includes("pdf") || file.type.includes("word") || file.type.includes("sheet")) {
    return "document";
  }
  return "other";
}

function MediaPage() {
  const can = useCan();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [bucket, setBucket] = useState<Bucket>("public-images");
  const [folder, setFolder] = useState("");
  const [altText, setAltText] = useState("");
  const [page, setPage] = useState(1);

  const params = { resource: "media_files" as const, page, pageSize: 25, sortDir: "desc" as const, filters: {} };
  const list = useQuery({
    queryKey: ["admin-list", params],
    queryFn: () => adminListFn({ data: params }),
    placeholderData: keepPreviousData,
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const signed = await mediaUploadUrlFn({
        data: {
          bucketId: bucket,
          fileName: file.name,
          folder: folder || "/",
          mimeType: file.type as never,
          sizeBytes: file.size,
        },
      });
      if (!signed.ok) throw new Error(signed.error.message);

      const response = await fetch(signed.signedUrl, {
        method: "PUT",
        headers: { "content-type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!response.ok) throw new Error("Transfert du fichier refusé");

      const registered = await registerMediaFn({
        data: {
          bucketId: bucket,
          storagePath: signed.path,
          fileName: file.name,
          mimeType: file.type || undefined,
          mediaType: mediaTypeOf(file),
          sizeBytes: file.size,
          folder: folder || "/",
          ...(altText ? { altText } : {}),
        },
      });
      if (!registered.ok) throw new Error(registered.error.message);
      return registered;
    },
    onSuccess: () => {
      toast.success("Média ajouté");
      setAltText("");
      if (inputRef.current) inputRef.current.value = "";
      void queryClient.invalidateQueries({ queryKey: ["admin-list"] });
    },
    onError: (error: Error) => toast.error("Upload impossible", { description: error.message }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteMediaFn({ data: { id } }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error("Suppression refusée", { description: result.error.message });
        return;
      }
      toast.success("Média supprimé");
      void queryClient.invalidateQueries({ queryKey: ["admin-list"] });
    },
  });

  const openMedia = useMutation({
    mutationFn: (id: string) => signedMediaUrlFn({ data: { id } }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error("Lien indisponible", { description: result.error.message });
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
    },
  });

  const rows = list.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Médias"
        description="Buckets privés : chaque consultation passe par une URL signée à durée limitée."
      />

      {can("media.create") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ajouter un fichier</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="bucket">Bucket</Label>
              <Select value={bucket} onValueChange={(value) => setBucket(value as Bucket)}>
                <SelectTrigger id="bucket">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUCKETS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="folder">Dossier</Label>
              <Input id="folder" value={folder} onChange={(event) => setFolder(event.target.value)} placeholder="2026/blog" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alt">Texte alternatif</Label>
              <Input id="alt" value={altText} onChange={(event) => setAltText(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Fichier</Label>
              <Input
                id="file"
                ref={inputRef}
                type="file"
                disabled={upload.isPending}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) upload.mutate(file);
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {list.isPending ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState title="Aucun média" description="Ajoutez une image ou un document pour démarrer." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fichier</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Bucket</TableHead>
                  <TableHead>Dossier</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Ajouté le</TableHead>
                  <TableHead className="w-40" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={String(row["id"])}>
                    <TableCell className="font-medium">{String(row["file_name"])}</TableCell>
                    <TableCell>{String(row["media_type"] ?? "—")}</TableCell>
                    <TableCell>{String(row["bucket_id"] ?? "—")}</TableCell>
                    <TableCell>{String(row["folder"] ?? "—")}</TableCell>
                    <TableCell>{formatBytes(row["size_bytes"])}</TableCell>
                    <TableCell>{formatDateTime(row["created_at"])}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => openMedia.mutate(String(row["id"]))}>
                        Voir
                      </Button>
                      {can("media.update") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => remove.mutate(String(row["id"]))}
                        >
                          Supprimer
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
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
          {page} / {list.data?.totalPages ?? 1}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= (list.data?.totalPages ?? 1)}
          onClick={() => setPage((value) => value + 1)}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
