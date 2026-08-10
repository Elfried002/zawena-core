-- =========================================================
-- STORAGE POLICIES
-- =========================================================
create policy "Staff can read files" on storage.objects for select to authenticated
  using (bucket_id in ('public-images','blog','portfolio','documents','logos') and public.is_staff());
create policy "Editors can upload files" on storage.objects for insert to authenticated
  with check (bucket_id in ('public-images','blog','portfolio','documents','logos') and public.can_edit_content());
create policy "Editors can update files" on storage.objects for update to authenticated
  using (bucket_id in ('public-images','blog','portfolio','documents','logos') and public.can_edit_content());
create policy "Admins can delete files" on storage.objects for delete to authenticated
  using (bucket_id in ('public-images','blog','portfolio','documents','logos') and public.is_admin());

-- Avatars: each user owns the folder named after their uid
create policy "Users read own avatar" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (public.is_staff() or (storage.foldername(name))[1] = auth.uid()::text));
create policy "Users upload own avatar" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users update own avatar" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users delete own avatar" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- =========================================================
-- FUNCTIONS
-- =========================================================
-- Remaining balance due on an invoice (total - amount_paid, never negative).
create or replace function public.invoice_balance_due(_invoice_id uuid)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select greatest(coalesce(total,0) - coalesce(amount_paid,0), 0)
  from public.invoices where id = _invoice_id;
$$;

grant execute on function public.invoice_balance_due(uuid) to authenticated;

-- =========================================================
-- VIEWS (security_invoker: caller's RLS applies)
-- =========================================================
create or replace view public.v_published_pages with (security_invoker = true) as
  select id, slug, title, excerpt, content, cover_media_id, seo_title, seo_description,
         seo_keywords, og_image_url, noindex, sort_order, published_at
  from public.pages
  where status = 'published' and deleted_at is null;

create or replace view public.v_published_services with (security_invoker = true) as
  select id, slug, title, summary, content, icon, cover_media_id, is_featured,
         seo_title, seo_description, sort_order, published_at
  from public.services
  where status = 'published' and deleted_at is null;

create or replace view public.v_published_projects with (security_invoker = true) as
  select p.id, p.slug, p.title, p.client_name, p.industry, p.summary, p.content,
         p.cover_media_id, p.external_url, p.delivered_at, p.is_featured,
         p.seo_title, p.seo_description, p.sort_order, p.published_at,
         coalesce(
           (select jsonb_agg(jsonb_build_object('id', t.id, 'slug', t.slug, 'name', t.name) order by t.sort_order)
            from public.project_technologies pt
            join public.technologies t on t.id = pt.technology_id
            where pt.project_id = p.id and t.is_active and t.deleted_at is null),
           '[]'::jsonb) as technologies
  from public.projects p
  where p.status = 'published' and p.deleted_at is null;

create or replace view public.v_published_posts with (security_invoker = true) as
  select b.id, b.slug, b.title, b.excerpt, b.content, b.cover_media_id, b.reading_minutes,
         b.published_at, b.seo_title, b.seo_description, b.og_image_url, b.view_count,
         c.slug as category_slug, c.name as category_name,
         pr.full_name as author_name, pr.avatar_url as author_avatar,
         coalesce(
           (select jsonb_agg(jsonb_build_object('slug', t.slug, 'name', t.name))
            from public.blog_post_tags bt join public.tags t on t.id = bt.tag_id
            where bt.post_id = b.id),
           '[]'::jsonb) as tags
  from public.blog_posts b
  left join public.blog_categories c on c.id = b.category_id and c.deleted_at is null
  left join public.profiles pr on pr.id = b.author_id
  where b.status = 'published' and b.deleted_at is null;

create or replace view public.v_published_faqs with (security_invoker = true) as
  select id, question, answer, category, service_id, sort_order
  from public.faqs
  where status = 'published' and deleted_at is null;

create or replace view public.v_pipeline_overview with (security_invoker = true) as
  select s.id as stage_id, s.key as stage_key, s.name as stage_name, s.sort_order,
         s.probability, s.is_won, s.is_lost,
         count(o.id) as opportunity_count,
         coalesce(sum(o.amount), 0) as total_amount,
         coalesce(sum(o.amount * s.probability / 100), 0) as weighted_amount
  from public.pipeline_stages s
  left join public.opportunities o
    on o.stage_id = s.id and o.deleted_at is null and o.closed_at is null
  group by s.id, s.key, s.name, s.sort_order, s.probability, s.is_won, s.is_lost;

create or replace view public.v_open_tickets with (security_invoker = true) as
  select t.id, t.number, t.subject, t.status, t.priority, t.created_at,
         t.first_response_at, t.assignee_id, t.requester_email,
         c.name as category_name, co.name as company_name,
         (select count(*) from public.ticket_replies r
           where r.ticket_id = t.id and r.deleted_at is null) as reply_count
  from public.tickets t
  left join public.ticket_categories c on c.id = t.category_id
  left join public.companies co on co.id = t.company_id
  where t.deleted_at is null and t.status not in ('resolved','closed');

create or replace view public.v_outstanding_invoices with (security_invoker = true) as
  select i.id, i.number, i.status, i.currency, i.issue_date, i.due_date,
         i.total, i.amount_paid, (i.total - i.amount_paid) as balance_due,
         (i.due_date is not null and i.due_date < current_date) as is_overdue,
         co.name as company_name, i.owner_id
  from public.invoices i
  left join public.companies co on co.id = i.company_id
  where i.deleted_at is null
    and i.status not in ('paid','void')
    and i.total > i.amount_paid;

grant select on public.v_published_pages, public.v_published_services,
  public.v_published_projects, public.v_published_posts, public.v_published_faqs
  to anon, authenticated;
grant select on public.v_pipeline_overview, public.v_open_tickets,
  public.v_outstanding_invoices to authenticated;

-- =========================================================
-- INDEXES
-- =========================================================
create index if not exists idx_pages_status_pub on public.pages (status, published_at desc) where deleted_at is null;
create index if not exists idx_services_status_sort on public.services (status, sort_order) where deleted_at is null;
create index if not exists idx_projects_status_featured on public.projects (status, is_featured, sort_order) where deleted_at is null;
create index if not exists idx_posts_status_pub on public.blog_posts (status, published_at desc) where deleted_at is null;
create index if not exists idx_posts_category on public.blog_posts (category_id) where deleted_at is null;
create index if not exists idx_faqs_status_cat on public.faqs (status, category, sort_order) where deleted_at is null;
create index if not exists idx_media_folder on public.media_files (folder, created_at desc) where deleted_at is null;

create index if not exists idx_posts_search on public.blog_posts using gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(excerpt,'')));
create index if not exists idx_companies_search on public.companies using gin (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(legal_name,'')));

create index if not exists idx_leads_status_created on public.leads (status, created_at desc) where deleted_at is null;
create index if not exists idx_leads_owner on public.leads (owner_id) where deleted_at is null;
create index if not exists idx_contacts_company on public.contacts (company_id) where deleted_at is null;
create index if not exists idx_opps_stage on public.opportunities (stage_id, expected_close_date) where deleted_at is null;
create index if not exists idx_opps_owner on public.opportunities (owner_id) where deleted_at is null;
create index if not exists idx_activities_entity on public.activities (entity_type, entity_id, occurred_at desc) where deleted_at is null;
create index if not exists idx_notes_entity on public.notes (entity_type, entity_id, created_at desc) where deleted_at is null;
create index if not exists idx_tasks_assignee_status on public.tasks (assignee_id, status, due_at) where deleted_at is null;

create index if not exists idx_quote_requests_status on public.quote_requests (status, created_at desc) where deleted_at is null;
create index if not exists idx_quotes_status on public.quotes (status, created_at desc) where deleted_at is null;
create index if not exists idx_quote_items_quote on public.quote_items (quote_id, sort_order);

create index if not exists idx_invoices_status_due on public.invoices (status, due_date) where deleted_at is null;
create index if not exists idx_invoice_items_invoice on public.invoice_items (invoice_id, sort_order);
create index if not exists idx_payments_invoice on public.payments (invoice_id, paid_at desc);

create index if not exists idx_tickets_status_priority on public.tickets (status, priority, created_at desc) where deleted_at is null;
create index if not exists idx_tickets_assignee on public.tickets (assignee_id) where deleted_at is null;
create index if not exists idx_ticket_replies_ticket on public.ticket_replies (ticket_id, created_at) where deleted_at is null;

create index if not exists idx_audit_logs_module_created on public.audit_logs (module, created_at desc);
create index if not exists idx_audit_logs_record on public.audit_logs (table_name, record_id);
create index if not exists idx_user_roles_user on public.user_roles (user_id);