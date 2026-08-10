# Zawena — Architecture Backend (Supabase / PostgreSQL)

> Document de référence de l'architecture de données Zawena.
> Stack : Supabase (PostgreSQL 15+, Auth, Storage, Realtime), RLS activée partout.

---

## 1. Principes directeurs

| Principe | Application concrète |
|---|---|
| Modularité | Un schéma unique `public`, mais un découpage strict par **domaine métier** (CMS, CRM, Quotes, Finance, Support, Users, Settings, Media, Audit). Chaque domaine est autonome et ne dépend des autres que par clés étrangères explicites. |
| Conventions homogènes | Toutes les tables métier : `id uuid pk default gen_random_uuid()`, `created_at`, `updated_at`, `deleted_at` (soft delete), `created_by`, `updated_by`. |
| Sécurité par défaut | RLS activée sur **toutes** les tables (event trigger `rls_auto_enable`). Aucun accès `anon` sauf lecture de contenu publié. Rôles dans une table dédiée `user_roles` (jamais sur `profiles`) → pas d'escalade de privilèges. |
| Moindre privilège | GRANTs explicites par rôle PostgREST (`anon`, `authenticated`, `service_role`). Fonctions helper non exécutables par `anon`. |
| Extensibilité | Tables polymorphes contrôlées (`activities`, `notes`, `tasks`, `audit_logs` via `entity_type`/`entity_id`) et `settings` clé/valeur JSONB → nouveaux modules sans migration des tables existantes. |
| Logique métier | En base uniquement ce qui garantit l'**intégrité** (totaux, numérotation, audit, timestamps). Le reste vit dans l'application (TanStack server functions). |

### Choix de conception documentés

1. **Soft delete (`deleted_at`)** plutôt que suppression physique : historique légal (devis, factures), corbeille produit. Les index métier sont **partiels** (`WHERE deleted_at IS NULL`) → aucun coût sur les lectures courantes.
2. **Polymorphisme contrôlé** pour `activities`, `notes`, `tasks` : une seule table timeline réutilisable par CRM, Support, futurs modules (Academy, Client Portal) au lieu de N tables jumelles. Le couple `(entity_type, entity_id)` est indexé.
3. **`settings` en JSONB clé/valeur groupée** (`group_key`, `key`, `value`, `is_public`) : configuration générale, SEO global, réseaux sociaux, infos société — extensible sans DDL.
4. **`media_files` comme registre central** : Storage stocke les octets, PostgreSQL stocke les métadonnées (alt, légende, dimensions, dossier, type). Toutes les entités référencent `cover_media_id` / `logo_media_id` → zéro duplication d'URL.
5. **Totaux calculés par triggers** (`recalculate_quote_totals`, `recalculate_invoice_totals`, `apply_payment_to_invoice`) : un total financier ne doit jamais dépendre du client appelant.
6. **Numérotation documentaire centralisée** (`document_sequences` + `next_document_number`) : séquences atomiques `QUO-2026-00001`, `INV-…`, `TCK-…`, sans collision concurrente.

---

## 2. Rôles et sécurité

### Enum `app_role`
`admin` · `editor` · `sales` · `support` · `client`

### Table `user_roles`
`id`, `user_id → auth.users`, `role app_role`, `created_at`, contrainte `unique(user_id, role)`.
Un utilisateur peut cumuler plusieurs rôles. **Aucune colonne `role` sur `profiles`.**

### Fonctions de sécurité (`SECURITY DEFINER`, `search_path = public`)

| Fonction | Rôle |
|---|---|
| `has_role(_user_id, _role)` | Test unitaire d'un rôle. Base de toutes les policies. |
| `is_admin()` | `has_role(auth.uid(), 'admin')`. |
| `is_staff()` | Vrai pour `admin`, `editor`, `sales`, `support`. Porte d'entrée du back-office. |
| `can_edit_content()` | Vrai pour `admin`, `editor`. Écriture CMS. |
| `invoice_balance_due(_invoice_id)` | Solde restant dû d'une facture (`total - amount_paid`, plancher 0). |
| `next_document_number(_key)` | Numéro de document séquentiel et atomique. |

`SECURITY DEFINER` est indispensable : les policies interrogent `user_roles`, une lecture directe provoquerait une récursion RLS. `EXECUTE` est révoqué pour `anon`.

### Matrice d'accès

| Domaine | anon | client | sales / support | editor | admin |
|---|---|---|---|---|---|
| CMS publié (pages, services, projets, blog, FAQ, technos) | lecture | lecture | lecture | lecture + écriture | tout |
| CMS brouillons | — | — | lecture | lecture + écriture | tout |
| Navigation, médias | lecture (publics) | lecture | lecture | écriture | tout |
| Leads / Companies / Contacts / Opportunités | insert formulaire | ses données | tout | — | tout |
| Demandes de devis | insert (formulaire public) | les siennes | tout | — | tout |
| Devis / Factures / Paiements | — | les siens (via contact) | tout | — | tout |
| Tickets / Réponses | — | les siens (hors notes internes) | tout | — | tout |
| `profiles` | — | le sien | le sien | le sien | tout |
| `user_roles` | — | — | lecture propre | lecture propre | tout |
| `audit_logs` | — | — | — | — | lecture seule (insert/update/delete refusés) |
| `document_sequences` | aucun accès direct (via fonction uniquement) |

---

## 3. Modules et tables

### 3.1 Website CMS
| Table | Objet | Points clés |
|---|---|---|
| `pages` | Pages statiques | `slug` unique, `content jsonb` (blocs), `status content_status`, SEO complet (`seo_title`, `seo_description`, `seo_keywords[]`, `og_image_url`, `noindex`). |
| `services` | Offres Zawena | `is_featured`, `icon`, `sort_order`, SEO. |
| `projects` | Portfolio | `client_name`, `industry`, `delivered_at`, `external_url`, `is_featured`. |
| `project_technologies` | N-N projets ↔ technos | PK composite. |
| `technologies` | Stack affichée | `category`, `logo_media_id`, `is_active`. |
| `service_technologies` | N-N services ↔ technos | PK composite. |
| `blog_posts` | Articles | `category_id`, `author_id → profiles`, `reading_minutes`, `view_count`. |
| `blog_categories` / `tags` / `blog_post_tags` | Taxonomie | Tags partagés (réutilisables par Academy plus tard). |
| `faqs` | FAQ | `category`, `service_id` optionnel → FAQ contextuelle. |
| `navigation_menus` / `navigation_items` | Menus | Arborescence via `parent_id` auto-référencé ; cible `page_id` **ou** `url` externe. |
| `media_files` | Registre fichiers | `bucket_id`, `storage_path`, `media_type`, `alt_text`, dimensions. |

`content_status` : `draft` · `scheduled` · `published` · `archived` → publication planifiée native.

### 3.2 CRM
`leads` (source, `status`, `score`, `utm jsonb`, colonnes de conversion vers `contacts`/`companies`) → `companies` (1-N) → `contacts` (N-1 company, 0-1 `auth.users` pour le futur portail) → `opportunities` (rattachée à `pipeline_stages`, montant, devise, date de clôture, `loss_reason`).
Transverses : `activities` (appel, email, meeting, demo…), `notes` (`is_pinned`), `tasks` (statut, priorité, assignation, échéance).

`pipeline_stages` est **données de configuration** (`key`, `probability`, `is_won`, `is_lost`, `sort_order`) : le pipeline évolue sans migration.

### 3.3 Quotes
`quote_requests` (formulaire public : budget, délai, description, `status`) → `quotes` (`number` unique, liens `quote_request_id` / `opportunity_id` / `company_id` / `contact_id`, `valid_until`, `sent_at`, `accepted_at`, `terms`) → `quote_items` (`service_id` optionnel, `quantity`, `unit_price`, `discount_percent`, `line_total` **colonne générée**).
Totaux du devis recalculés par trigger à chaque mutation de ligne.

### 3.4 Finance
`invoices` (`number`, `quote_id` d'origine, `issue_date`, `due_date`, `subtotal`, `tax_rate`, `tax_amount`, `total`, `amount_paid`, `pdf_media_id`) → `invoice_items` (`line_total` générée) et `payments` (`method`, `reference`, `paid_at`).
Trigger `apply_payment_to_invoice` : recalcule `amount_paid` et passe le statut en `partially_paid` / `paid`. Un paiement ne modifie jamais un statut à la main côté client.

### 3.5 Support
`ticket_categories` (config) → `tickets` (`number`, `status ticket_status`, `priority priority_level`, `requester_id` ou `requester_email` pour un demandeur non inscrit, SLA : `first_response_at`, `resolved_at`, `closed_at`) → `ticket_replies` (`is_internal` : notes visibles du staff uniquement).

### 3.6 Utilisateurs
`profiles` (1-1 `auth.users`, alimentée par le trigger `handle_new_user` sur `auth.users`) + `user_roles`. Les permissions fines dérivent des rôles côté application ; aucune table `permissions` prématurée.

### 3.7 Paramètres et Audit
`settings` : `(group_key, key)` unique, `value jsonb`, `is_public` → seuls les réglages publics sont lisibles par `anon`.
`audit_logs` : `module`, `action audit_action`, `table_name`, `record_id`, `actor_id`, `before_data`/`after_data jsonb`, `ip_address`, `user_agent`. Append-only, alimentée par `audit_row_change(module)` sur les tables sensibles (`invoices`, `payments`, `quotes`, `settings`, `user_roles`).

---

## 4. Vues SQL

Toutes en `security_invoker = true` : la RLS de l'appelant s'applique (pas de fuite de données via vue).

| Vue | Rôle | Accès |
|---|---|---|
| `v_published_pages` | Pages publiées + SEO prêt à consommer | anon, authenticated |
| `v_published_services` | Services publiés triés | anon, authenticated |
| `v_published_projects` | Portfolio publié **avec technologies agrégées en JSON** (évite un second aller-retour) | anon, authenticated |
| `v_published_posts` | Articles publiés + catégorie, auteur et tags dénormalisés | anon, authenticated |
| `v_published_faqs` | FAQ publiée | anon, authenticated |
| `v_pipeline_overview` | Par étape : nombre d'opportunités, montant total, **montant pondéré** par probabilité | authenticated |
| `v_open_tickets` | Tickets non résolus + catégorie, société, nombre de réponses | authenticated |
| `v_outstanding_invoices` | Factures impayées, `balance_due`, `is_overdue` | authenticated |

---

## 5. Storage

Buckets **privés** (la politique du workspace interdit les buckets publics ; l'accès se fait par URL signée générée côté serveur) :

| Bucket | Contenu | Écriture | Lecture |
|---|---|---|---|
| `public-images` | Visuels du site vitrine | `editor`+ | staff (+ URL signée pour le public) |
| `blog` | Couvertures et images d'articles | `editor`+ | staff (+ URL signée) |
| `portfolio` | Visuels de réalisations | `editor`+ | staff (+ URL signée) |
| `documents` | Devis/factures PDF, pièces jointes | `editor`+ | staff |
| `logos` | Logos Zawena, clients, technologies | `editor`+ | staff |
| `avatars` | Photos de profil | propriétaire (`avatars/<uid>/…`) | propriétaire + staff |

Convention de chemin : `<bucket>/<entité>/<uuid>/<nom-fichier>`. Suppression réservée aux `admin` (hors avatar personnel). Chaque objet uploadé doit avoir une ligne `media_files` correspondante.

---

## 6. Performances

- **Index partiels** `WHERE deleted_at IS NULL` sur les tables à soft delete.
- **Index composites orientés requêtes réelles** : `(status, published_at desc)` pour le CMS, `(status, priority, created_at desc)` pour les tickets, `(stage_id, expected_close_date)` pour le pipeline, `(status, due_date)` pour les factures.
- **Recherche plein texte** : index GIN `to_tsvector` sur `blog_posts(title, excerpt)` et `companies(name, legal_name)`.
- **Index d'appartenance** : `owner_id`, `assignee_id`, `company_id`, `invoice_id`, `quote_id`, `ticket_id` — indispensables car les policies RLS filtrent dessus.
- **Pagination** : keyset (`created_at`, `id`) plutôt que `OFFSET`, avec la limite Data API de 1000 lignes en tête.
- **Audit** : `(module, created_at desc)` et `(table_name, record_id)`.

---

## 7. Évolutivité — feuille de route

| Module futur | Impact sur l'existant |
|---|---|
| **Client Portal** | Aucun DDL sur les tables métier : `contacts.user_id` relie déjà un compte à un contact ; ajouter les policies `client` en lecture sur ses devis / factures / tickets. |
| **Academy** | Nouvelles tables `courses`, `lessons`, `enrollments` réutilisant `media_files`, `tags` et `profiles`. |
| **Automation / AI Center** | Tables `workflows`, `workflow_runs`, `ai_conversations` + réutilisation de `audit_logs` et du polymorphisme `entity_type/entity_id`. |
| **Multi-SaaS / multi-tenant** | Ajouter une table `organizations` + `organization_members`, puis une colonne `organization_id` nullable indexée sur les tables concernées ; les policies passent de `owner_id` à l'appartenance organisation. Prévu, non prématuré. |
| **API publique** | Routes serveur sous `/api/public/*` avec clés d'API dédiées (table `api_keys` : hash, scopes, quotas) ; la RLS reste la dernière ligne de défense. |
| **Realtime** | `ALTER PUBLICATION supabase_realtime ADD TABLE …` sur `tickets`, `ticket_replies`, `tasks` quand le besoin apparaît — RLS conservée pour filtrer les abonnés. |

### Règles de maintenance
1. Toute nouvelle table `public` : `CREATE TABLE` → `GRANT` → `ENABLE RLS` → `CREATE POLICY`, dans la même migration.
2. Colonnes standard obligatoires + triggers `set_updated_at` et `set_audit_actor`.
3. Validation temporelle par trigger, jamais par `CHECK` (immutabilité requise).
4. Toute table financière ou sensible reçoit `audit_row_change('<module>')`.
5. Aucune donnée dupliquée : passer par une clé étrangère ou une vue.
