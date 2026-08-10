-- ============================================================
-- 1. RBAC — permissions par action
-- ============================================================
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, permission)
);
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "role_permissions_read" ON public.role_permissions;
CREATE POLICY "role_permissions_read" ON public.role_permissions
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "role_permissions_admin_write" ON public.role_permissions;
CREATE POLICY "role_permissions_admin_write" ON public.role_permissions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id
      AND (rp.permission = _permission OR rp.permission = '*')
  );
$$;
REVOKE ALL ON FUNCTION public.has_permission(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.my_permissions()
RETURNS TABLE(permission text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT DISTINCT rp.permission
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role = ur.role
  WHERE ur.user_id = auth.uid();
$$;
REVOKE ALL ON FUNCTION public.my_permissions() FROM anon;
GRANT EXECUTE ON FUNCTION public.my_permissions() TO authenticated, service_role;

-- ============================================================
-- 2. Notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event public.notification_event NOT NULL,
  channel public.notification_channel NOT NULL DEFAULT 'dashboard',
  title text NOT NULL,
  body text,
  entity_type text,
  entity_id uuid,
  link text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_read_own" ON public.notifications;
CREATE POLICY "notifications_read_own" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP TRIGGER IF EXISTS notifications_updated_at ON public.notifications;
CREATE TRIGGER notifications_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id, created_at DESC) WHERE read_at IS NULL;

-- ============================================================
-- 3. Idempotence
-- ============================================================
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL,
  key text NOT NULL,
  actor_id uuid,
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scope, key)
);
GRANT ALL ON public.idempotency_keys TO service_role;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. Analytics
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  path text,
  referrer text,
  entity_type text,
  entity_id uuid,
  session_hash text,
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "analytics_admin_read" ON public.analytics_events;
CREATE POLICY "analytics_admin_read" ON public.analytics_events
  FOR SELECT TO authenticated USING (public.is_staff());
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_date
  ON public.analytics_events (event_name, created_at DESC);

-- ============================================================
-- 5. Anti-abus / rate limiting (serveur uniquement)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rate_limit_hits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL,
  identifier text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.rate_limit_hits TO service_role;
ALTER TABLE public.rate_limit_hits ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_rate_limit_scope_id
  ON public.rate_limit_hits (scope, identifier, created_at DESC);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _scope text, _identifier text, _max_hits integer, _window_seconds integer
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count integer;
BEGIN
  DELETE FROM public.rate_limit_hits
   WHERE created_at < now() - make_interval(secs => _window_seconds * 10);

  SELECT count(*) INTO v_count
    FROM public.rate_limit_hits
   WHERE scope = _scope AND identifier = _identifier
     AND created_at > now() - make_interval(secs => _window_seconds);

  IF v_count >= _max_hits THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limit_hits(scope, identifier) VALUES (_scope, _identifier);
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.check_rate_limit(text, text, integer, integer) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) TO service_role;

-- ============================================================
-- 6. Historique des étapes du pipeline
-- ============================================================
CREATE TABLE IF NOT EXISTS public.opportunity_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  from_stage_id uuid REFERENCES public.pipeline_stages(id),
  to_stage_id uuid NOT NULL REFERENCES public.pipeline_stages(id),
  changed_by uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.opportunity_stage_history TO authenticated;
GRANT ALL ON public.opportunity_stage_history TO service_role;
ALTER TABLE public.opportunity_stage_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "opp_stage_history_staff_read" ON public.opportunity_stage_history;
CREATE POLICY "opp_stage_history_staff_read" ON public.opportunity_stage_history
  FOR SELECT TO authenticated USING (public.is_staff());
CREATE INDEX IF NOT EXISTS idx_opp_stage_history_opp
  ON public.opportunity_stage_history (opportunity_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.log_opportunity_stage_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.opportunity_stage_history(opportunity_id, to_stage_id, changed_by)
    VALUES (new.id, new.stage_id, auth.uid());
  ELSIF (new.stage_id IS DISTINCT FROM old.stage_id) THEN
    INSERT INTO public.opportunity_stage_history(opportunity_id, from_stage_id, to_stage_id, changed_by)
    VALUES (new.id, old.stage_id, new.stage_id, auth.uid());
  END IF;
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS opportunities_stage_history ON public.opportunities;
CREATE TRIGGER opportunities_stage_history AFTER INSERT OR UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.log_opportunity_stage_change();

-- ============================================================
-- 7. Versionnage des devis + concurrence optimiste
-- ============================================================
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS revision_of uuid REFERENCES public.quotes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS viewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS lock_version integer NOT NULL DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_quotes_revision_of ON public.quotes (revision_of);

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS lock_version integer NOT NULL DEFAULT 1;

CREATE OR REPLACE FUNCTION public.bump_lock_version()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  new.lock_version = coalesce(old.lock_version, 0) + 1;
  RETURN new;
END;
$$;
DROP TRIGGER IF EXISTS quotes_lock_version ON public.quotes;
CREATE TRIGGER quotes_lock_version BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.bump_lock_version();
DROP TRIGGER IF EXISTS invoices_lock_version ON public.invoices;
CREATE TRIGGER invoices_lock_version BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.bump_lock_version();

-- ============================================================
-- 8. Cycle de vie des comptes
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status public.user_account_status NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz;

CREATE OR REPLACE FUNCTION public.is_account_active()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
     WHERE id = auth.uid() AND status = 'active' AND deleted_at IS NULL
  );
$$;
REVOKE ALL ON FUNCTION public.is_account_active() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_account_active() TO authenticated, service_role;

-- ============================================================
-- 9. Séquences documentaires
-- ============================================================
INSERT INTO public.document_sequences (key, prefix, current_value)
VALUES ('quote', 'ZAW', 0), ('invoice', 'INV', 0), ('ticket', 'TCK', 0)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 10. Matrice de permissions initiale
-- ============================================================
INSERT INTO public.role_permissions (role, permission)
VALUES
  ('super_admin','*'),
  ('admin','*')
ON CONFLICT (role, permission) DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT r.role, p.permission FROM (VALUES
  ('editor'::public.app_role)) r(role),
  (VALUES
    ('pages.read'),('pages.create'),('pages.update'),('pages.delete'),
    ('services.read'),('services.create'),('services.update'),
    ('projects.read'),('projects.create'),('projects.update'),
    ('blog.read'),('blog.create'),('blog.update'),('blog.publish'),
    ('faqs.read'),('faqs.create'),('faqs.update'),('faqs.delete'),
    ('technologies.read'),('technologies.update'),
    ('navigation.read'),('navigation.update'),
    ('media.read'),('media.create'),('media.update'),
    ('settings.read'),('analytics.read')
  ) p(permission)
ON CONFLICT (role, permission) DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT r.role, p.permission FROM (VALUES
  ('sales'::public.app_role)) r(role),
  (VALUES
    ('leads.read'),('leads.create'),('leads.update'),
    ('contacts.read'),('contacts.create'),('contacts.update'),
    ('companies.read'),('companies.create'),('companies.update'),
    ('opportunities.read'),('opportunities.create'),('opportunities.update'),
    ('activities.read'),('activities.create'),
    ('tasks.read'),('tasks.create'),('tasks.update'),
    ('quote_requests.read'),('quote_requests.update'),
    ('quotes.read'),('quotes.create'),('quotes.update'),('quotes.send'),
    ('invoices.read'),
    ('pages.read'),('services.read'),('projects.read'),('media.read'),
    ('analytics.read')
  ) p(permission)
ON CONFLICT (role, permission) DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT r.role, p.permission FROM (VALUES
  ('support'::public.app_role)) r(role),
  (VALUES
    ('tickets.read'),('tickets.create'),('tickets.update'),('tickets.assign'),('tickets.close'),
    ('ticket_replies.read'),('ticket_replies.create'),
    ('ticket_categories.read'),
    ('contacts.read'),('companies.read'),
    ('activities.read'),('activities.create'),
    ('tasks.read'),('tasks.create'),('tasks.update'),
    ('faqs.read'),('analytics.read')
  ) p(permission)
ON CONFLICT (role, permission) DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT r.role, p.permission FROM (VALUES
  ('finance'::public.app_role)) r(role),
  (VALUES
    ('invoices.read'),('invoices.create'),('invoices.update'),('invoices.send'),
    ('payments.read'),('payments.create'),
    ('quotes.read'),
    ('companies.read'),('contacts.read'),
    ('analytics.read')
  ) p(permission)
ON CONFLICT (role, permission) DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT r.role, p.permission FROM (VALUES
  ('viewer'::public.app_role)) r(role),
  (VALUES
    ('pages.read'),('services.read'),('projects.read'),('blog.read'),('faqs.read'),
    ('leads.read'),('contacts.read'),('companies.read'),('opportunities.read'),
    ('quotes.read'),('invoices.read'),('tickets.read'),('analytics.read')
  ) p(permission)
ON CONFLICT (role, permission) DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT r.role, p.permission FROM (VALUES
  ('client'::public.app_role)) r(role),
  (VALUES
    ('quotes.read'),('invoices.read'),('tickets.read'),('tickets.create'),
    ('ticket_replies.read'),('ticket_replies.create')
  ) p(permission)
ON CONFLICT (role, permission) DO NOTHING;