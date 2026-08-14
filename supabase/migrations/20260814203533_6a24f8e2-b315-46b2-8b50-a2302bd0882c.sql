-- Durcissement : ces fonctions ne sont utilisées que par des policies TO authenticated.
REVOKE EXECUTE ON FUNCTION public.is_staff() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_edit_content() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_edit_content() TO authenticated, service_role;