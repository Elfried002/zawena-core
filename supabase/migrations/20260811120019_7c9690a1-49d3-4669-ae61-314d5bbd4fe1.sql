
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'super_admin');
$$;
revoke all on function public.is_super_admin() from anon;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin');
$$;
revoke all on function public.is_admin() from anon;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('super_admin','admin','editor','sales','support','finance','viewer')
  );
$$;
revoke all on function public.is_staff() from anon;

create or replace function public.can_edit_content()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('super_admin','admin','editor')
  );
$$;
revoke all on function public.can_edit_content() from anon;

drop policy if exists role_permissions_admin_write on public.role_permissions;
create policy role_permissions_super_admin_write
  on public.role_permissions for all to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());
