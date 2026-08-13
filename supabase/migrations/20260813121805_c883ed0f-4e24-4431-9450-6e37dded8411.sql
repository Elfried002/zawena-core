-- 1) Internal SECURITY DEFINER helpers and trigger functions must not be
--    callable through the Data API (PostgREST) by anon/authenticated.
REVOKE EXECUTE ON FUNCTION public.next_document_number(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.count_active_super_admins() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_account_active() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.my_permissions() FROM anon;
REVOKE EXECUTE ON FUNCTION public.invoice_balance_due(uuid) FROM anon;

-- Trigger-only functions: never callable directly.
REVOKE EXECUTE ON FUNCTION public.apply_payment_to_invoice() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_row_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_lock_version() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_opportunity_stage_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_super_admin_roles() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_super_admin_status() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalculate_invoice_totals() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalculate_quote_totals() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_audit_actor() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated;

-- Keep the service role able to run server-side business logic.
GRANT EXECUTE ON FUNCTION public.next_document_number(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.count_active_super_admins() TO service_role;

-- 2) role_permissions must not leak the full RBAC matrix to every signed-in user.
DROP POLICY IF EXISTS role_permissions_read ON public.role_permissions;
CREATE POLICY role_permissions_staff_read ON public.role_permissions
  FOR SELECT TO authenticated USING (public.is_staff());

-- 3) Public quote requests are created server-side (service role) after
--    validation, honeypot and rate limiting: no direct insert path needed.
DROP POLICY IF EXISTS qr_auth_insert ON public.quote_requests;