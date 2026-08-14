-- 1. has_permission: interdiction d'interroger les permissions d'un autre utilisateur
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_user <> 'service_role' AND (auth.uid() IS NULL OR _user_id IS DISTINCT FROM auth.uid()) THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id
      AND rp.permission = _permission
  );
END;
$$;

REVOKE ALL ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated, service_role;

-- 2. Fonctions internes non utilisées par l'application : plus d'exécution côté client
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

REVOKE ALL ON FUNCTION public.invoice_balance_due(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.invoice_balance_due(uuid) TO service_role;

-- 3. Storage : séparer le bucket "documents" des buckets de contenu
DROP POLICY IF EXISTS "Staff can read files" ON storage.objects;
DROP POLICY IF EXISTS "Editors can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Editors can update files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete files" ON storage.objects;

CREATE POLICY "Staff can read content files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = ANY (ARRAY['public-images','blog','portfolio','logos'])
  AND public.is_staff()
);

CREATE POLICY "Editors can upload content files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = ANY (ARRAY['public-images','blog','portfolio','logos'])
  AND public.can_edit_content()
);

CREATE POLICY "Editors can update content files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = ANY (ARRAY['public-images','blog','portfolio','logos'])
  AND public.can_edit_content()
);

CREATE POLICY "Admins can delete content files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = ANY (ARRAY['public-images','blog','portfolio','logos'])
  AND public.is_admin()
);

-- Bucket documents : permission explicite + fichier réellement catalogué
CREATE POLICY "Documents read requires media permission and catalog entry"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents'
  AND public.has_permission(auth.uid(), 'media.read')
  AND EXISTS (
    SELECT 1 FROM public.media_files mf
    WHERE mf.bucket_id = 'documents' AND mf.storage_path = storage.objects.name
  )
);

CREATE POLICY "Documents upload requires media create permission"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND public.has_permission(auth.uid(), 'media.create')
);

CREATE POLICY "Documents update requires media update permission"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents'
  AND public.has_permission(auth.uid(), 'media.update')
  AND EXISTS (
    SELECT 1 FROM public.media_files mf
    WHERE mf.bucket_id = 'documents' AND mf.storage_path = storage.objects.name
  )
);

CREATE POLICY "Documents delete restricted to admins"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents'
  AND public.is_admin()
);