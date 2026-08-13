-- Default PUBLIC EXECUTE grant is what actually exposed these functions;
-- REVOKE FROM anon/authenticated alone did not remove it.
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.count_active_super_admins() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.apply_payment_to_invoice() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.audit_row_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bump_lock_version() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_opportunity_stage_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.protect_super_admin_roles() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.protect_super_admin_status() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.recalculate_invoice_totals() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.recalculate_quote_totals() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_audit_actor() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC;

-- Helpers used inside RLS policies: keep them for signed-in users only.
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_staff() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_account_active() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_edit_content() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.my_permissions() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.invoice_balance_due(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_account_active() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_edit_content() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.my_permissions() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.invoice_balance_due(uuid) TO authenticated, service_role;

-- Public content policies rely on these while browsing anonymously.
GRANT EXECUTE ON FUNCTION public.is_staff() TO anon;
GRANT EXECUTE ON FUNCTION public.can_edit_content() TO anon;