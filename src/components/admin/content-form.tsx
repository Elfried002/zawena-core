/**
 * Éditeur CMS générique (création + édition) pour les cinq entités de contenu.
 * Les champs sont décrits ici ; la validation faisant foi reste côté serveur
 * (Zod + permissions) — ce formulaire n'est qu'une représentation.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ContentStatusBar } from "./content-actions";
import { EmptyState, TableSkeleton } from "./ui-bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cmsRefsFn, contentDetailFn } from "@/lib/admin.functions";
import { createContentFn, updateContentFn } from "@/lib/admin-actions.functions";
import { slugify, type CmsEntity } from "@/services/cms/cms.schemas";

type Values = Record<string, string | boolean | string[]>;

interface FieldDef {
  name: string;
  label: string;
  kind: "text" | "textarea" | "number" | "date" | "switch" | "select" | "multi";
  column?: string;
  ref?: "technologies" | "categories" | "tags" | "services";
  hint?: string;
  wide?: boolean;
}

const SEO_FIELDS: FieldDef[] = [
  { name: "seoTitle", label: "Titre SEO (60 car. max)", kind: "text" },
  { name: "seoDescription", label: "Meta description (160 car. max)", kind: "textarea", wide: true },
];

const ENTITY_FIELDS: Record<CmsEntity, FieldDef[]> = {
  pages: [
    { name: "title", label: "Titre", kind: "text" },
    { name: "slug", label: "Slug", kind: "text", hint: "Laisser vide pour générer depuis le titre" },
    { name: "excerpt", label: "Accroche", kind: "textarea", wide: true },
    { name: "body", label: "Contenu", kind: "textarea", wide: true },
    { name: "sortOrder", label: "Ordre", kind: "number", column: "sort_order" },
    { name: "noindex", label: "Exclure des moteurs de recherche", kind: "switch" },
    ...SEO_FIELDS,
    { name: "ogImageUrl", label: "Image de partage (URL)", kind: "text", column: "og_image_url" },
  ],
  services: [
    { name: "title", label: "Titre", kind: "text" },
    { name: "slug", label: "Slug", kind: "text" },
    { name: "summary", label: "Résumé", kind: "textarea", wide: true },
    { name: "body", label: "Contenu", kind: "textarea", wide: true },
    { name: "icon", label: "Icône (nom lucide)", kind: "text" },
    { name: "sortOrder", label: "Ordre", kind: "number", column: "sort_order" },
    { name: "isFeatured", label: "Mis en avant", kind: "switch", column: "is_featured" },
    { name: "technologyIds", label: "Technologies", kind: "multi", ref: "technologies", wide: true },
    ...SEO_FIELDS,
  ],
  projects: [
    { name: "title", label: "Titre", kind: "text" },
    { name: "slug", label: "Slug", kind: "text" },
    { name: "clientName", label: "Client", kind: "text", column: "client_name", hint: "Uniquement si la référence est autorisée" },
    { name: "industry", label: "Secteur", kind: "text" },
    { name: "summary", label: "Résumé", kind: "textarea", wide: true },
    { name: "body", label: "Contenu", kind: "textarea", wide: true },
    { name: "externalUrl", label: "Lien externe", kind: "text", column: "external_url" },
    { name: "deliveredAt", label: "Livré le", kind: "date", column: "delivered_at" },
    { name: "sortOrder", label: "Ordre", kind: "number", column: "sort_order" },
    { name: "isFeatured", label: "Mis en avant", kind: "switch", column: "is_featured" },
    { name: "isDemo", label: "Contenu de démonstration", kind: "switch", hint: "Jamais présenté comme une référence réelle" },
    { name: "technologyIds", label: "Technologies", kind: "multi", ref: "technologies", wide: true },
    ...SEO_FIELDS,
  ],
  blog_posts: [
    { name: "title", label: "Titre", kind: "text" },
    { name: "slug", label: "Slug", kind: "text" },
    { name: "excerpt", label: "Accroche", kind: "textarea", wide: true },
    { name: "body", label: "Contenu", kind: "textarea", wide: true },
    { name: "categoryId", label: "Catégorie", kind: "select", ref: "categories", column: "category_id" },
    { name: "readingMinutes", label: "Temps de lecture (min)", kind: "number", column: "reading_minutes" },
    { name: "tagIds", label: "Tags", kind: "multi", ref: "tags", wide: true },
    ...SEO_FIELDS,
    { name: "ogImageUrl", label: "Image de partage (URL)", kind: "text", column: "og_image_url" },
  ],
  faqs: [
    { name: "question", label: "Question", kind: "text", wide: true },
    { name: "answer", label: "Réponse", kind: "textarea", wide: true },
    { name: "category", label: "Catégorie", kind: "text" },
    { name: "serviceId", label: "Service lié", kind: "select", ref: "services", column: "service_id" },
    { name: "sortOrder", label: "Ordre", kind: "number", column: "sort_order" },
  ],
};

const BOOLEAN_FIELDS = new Set(["noindex", "isFeatured", "isDemo"]);
const NUMBER_FIELDS = new Set(["sortOrder", "readingMinutes"]);

function emptyValues(entity: CmsEntity): Values {
  const values: Values = {};
  for (const field of ENTITY_FIELDS[entity]) {
    values[field.name] = field.kind === "switch" ? false : field.kind === "multi" ? [] : "";
  }
  if (entity === "faqs") values["category"] = "general";
  return values;
}

export function ContentForm({ entity, id }: { entity: CmsEntity; id: string }) {
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fields = ENTITY_FIELDS[entity];

  const detail = useQuery({
    queryKey: ["content", entity, id],
    queryFn: () => contentDetailFn({ data: { entity, id } }),
    enabled: !isNew,
  });
  const refs = useQuery({ queryKey: ["cms-refs"], queryFn: () => cmsRefsFn() });

  const [values, setValues] = useState<Values>(() => emptyValues(entity));
  const [loaded, setLoaded] = useState(isNew);

  useEffect(() => {
    if (isNew || !detail.data || loaded) return;
    const row = detail.data.row;
    const next = emptyValues(entity);
    for (const field of fields) {
      if (field.name === "body") {
        const content = (row["content"] ?? {}) as Record<string, unknown>;
        next["body"] = typeof content["body"] === "string" ? content["body"] : "";
        continue;
      }
      if (field.kind === "multi") {
        next[field.name] =
          field.ref === "tags" ? [...detail.data.tagIds] : [...detail.data.technologyIds];
        continue;
      }
      const raw = row[field.column ?? field.name];
      if (field.kind === "switch") next[field.name] = Boolean(raw);
      else if (field.name === "isDemo") next[field.name] = false;
      else next[field.name] = raw === null || raw === undefined ? "" : String(raw);
    }
    if (entity === "projects") {
      const content = (row["content"] ?? {}) as Record<string, unknown>;
      next["isDemo"] = Boolean(content["is_demo"]);
    }
    setValues(next);
    setLoaded(true);
  }, [detail.data, entity, fields, isNew, loaded]);

  const payload = useMemo(() => {
    const output: Record<string, unknown> = {};
    for (const field of fields) {
      const value = values[field.name];
      if (field.name === "body") continue;
      if (field.kind === "switch") {
        output[field.name] = Boolean(value);
        continue;
      }
      if (field.kind === "multi") {
        output[field.name] = Array.isArray(value) ? value : [];
        continue;
      }
      const text = typeof value === "string" ? value.trim() : "";
      if (!text) continue;
      output[field.name] = NUMBER_FIELDS.has(field.name) ? Number(text) : text;
    }
    if (entity !== "faqs") {
      const body = typeof values["body"] === "string" ? values["body"] : "";
      output["content"] = body ? { body } : {};
      if (!output["slug"] && typeof values["title"] === "string" && values["title"]) {
        output["slug"] = slugify(values["title"]);
      }
    }
    return output;
  }, [entity, fields, values]);

  const save = useMutation({
    mutationFn: async () => {
      const data = { entity, payload } as never;
      return isNew
        ? createContentFn({ data })
        : updateContentFn({ data: { ...(data as object), id } as never });
    },
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error("Enregistrement refusé", { description: result.error.message });
        return;
      }
      toast.success(isNew ? "Contenu créé en brouillon" : "Contenu mis à jour");
      void queryClient.invalidateQueries({ queryKey: ["admin-list"] });
      void queryClient.invalidateQueries({ queryKey: ["content", entity] });
      if (isNew) {
        const created = result as unknown as Record<string, string>;
        const newId =
          created["pageId"] ?? created["serviceId"] ?? created["projectId"] ?? created["postId"] ?? created["faqId"];
        if (newId) void navigate({ to: `/admin/content/${SECTION[entity]}/${newId}` as never });
      }
    },
    onError: () => toast.error("Enregistrement impossible"),
  });

  if (!isNew && detail.isPending) return <TableSkeleton rows={6} />;
  if (!isNew && (detail.isError || !detail.data)) {
    return (
      <EmptyState
        title="Contenu introuvable"
        description="Il a peut-être été archivé, ou vous n'avez pas les droits d'accès."
      />
    );
  }

  const status = (detail.data?.row["status"] as string | undefined) ?? "draft";
  const options = (field: FieldDef) => {
    const list = refs.data?.[field.ref ?? "technologies"] ?? [];
    return list.map((item) => ({
      value: item.id,
      label: "name" in item ? item.name : (item as { title: string }).title,
    }));
  };

  return (
    <div className="space-y-6">
      {!isNew && (
        <ContentStatusBar
          entity={entity}
          id={id}
          status={status}
          onDone={() => {
            void queryClient.invalidateQueries({ queryKey: ["content", entity, id] });
            void queryClient.invalidateQueries({ queryKey: ["admin-list"] });
          }}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{isNew ? "Nouveau contenu" : "Édition"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-5 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate();
            }}
          >
            {fields.map((field) => (
              <div key={field.name} className={field.wide ? "space-y-2 sm:col-span-2" : "space-y-2"}>
                <Label htmlFor={`f-${field.name}`}>{field.label}</Label>
                {field.kind === "textarea" ? (
                  <Textarea
                    id={`f-${field.name}`}
                    rows={field.name === "body" || field.name === "answer" ? 8 : 3}
                    value={String(values[field.name] ?? "")}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field.name]: event.target.value }))
                    }
                  />
                ) : field.kind === "switch" ? (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`f-${field.name}`}
                      checked={Boolean(values[field.name])}
                      onCheckedChange={(checked) =>
                        setValues((current) => ({ ...current, [field.name]: checked === true }))
                      }
                    />
                    <span className="text-sm text-muted-foreground">{field.hint ?? "Activer"}</span>
                  </div>
                ) : field.kind === "select" ? (
                  <Select
                    value={String(values[field.name] ?? "") || "__none"}
                    onValueChange={(value) =>
                      setValues((current) => ({ ...current, [field.name]: value === "__none" ? "" : value }))
                    }
                  >
                    <SelectTrigger id={`f-${field.name}`}>
                      <SelectValue placeholder="Aucun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Aucun</SelectItem>
                      {options(field).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.kind === "multi" ? (
                  <div className="flex flex-wrap gap-2">
                    {options(field).length === 0 && (
                      <p className="text-sm text-muted-foreground">Aucun élément disponible.</p>
                    )}
                    {options(field).map((option) => {
                      const selected = (values[field.name] as string[]).includes(option.value);
                      return (
                        <Button
                          key={option.value}
                          type="button"
                          size="sm"
                          variant={selected ? "default" : "outline"}
                          onClick={() =>
                            setValues((current) => {
                              const list = current[field.name] as string[];
                              return {
                                ...current,
                                [field.name]: selected
                                  ? list.filter((item) => item !== option.value)
                                  : [...list, option.value],
                              };
                            })
                          }
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <Input
                    id={`f-${field.name}`}
                    type={field.kind === "number" ? "number" : field.kind === "date" ? "date" : "text"}
                    value={String(values[field.name] ?? "")}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field.name]: event.target.value }))
                    }
                  />
                )}
                {field.hint && field.kind !== "switch" && (
                  <p className="text-xs text-muted-foreground">{field.hint}</p>
                )}
              </div>
            ))}

            <div className="sm:col-span-2">
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Enregistrement…" : isNew ? "Créer le brouillon" : "Enregistrer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export const SECTION: Record<CmsEntity, string> = {
  pages: "pages",
  services: "services",
  projects: "projects",
  blog_posts: "blog",
  faqs: "faqs",
};

export { BOOLEAN_FIELDS };
