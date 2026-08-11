
create or replace function public.count_active_super_admins()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.user_roles ur
  join public.profiles p on p.id = ur.user_id
  where ur.role = 'super_admin'
    and p.status = 'active'
    and p.deleted_at is null;
$$;

revoke all on function public.count_active_super_admins() from anon;

create or replace function public.protect_super_admin_roles()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_is_super boolean;
begin
  select public.has_role(auth.uid(), 'super_admin') into v_is_super;

  if (tg_op = 'DELETE') then
    if old.role = 'super_admin' then
      if auth.uid() is not null and coalesce(v_is_super, false) = false then
        raise exception 'Seul un super_admin peut retirer le rôle super_admin';
      end if;
      if public.count_active_super_admins() <= 1 then
        raise exception 'Impossible de retirer le dernier super_admin actif';
      end if;
    end if;
    return old;
  end if;

  if new.role = 'super_admin' and auth.uid() is not null and coalesce(v_is_super, false) = false then
    raise exception 'Seul un super_admin peut attribuer le rôle super_admin';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_super_admin_roles on public.user_roles;
create trigger protect_super_admin_roles
before insert or update or delete on public.user_roles
for each row execute function public.protect_super_admin_roles();

create or replace function public.protect_super_admin_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_is_super boolean; v_target_super boolean;
begin
  select exists (
    select 1 from public.user_roles where user_id = new.id and role = 'super_admin'
  ) into v_target_super;

  if not v_target_super then return new; end if;

  select public.has_role(auth.uid(), 'super_admin') into v_is_super;

  if (new.status is distinct from old.status
      or new.deleted_at is distinct from old.deleted_at
      or new.is_active is distinct from old.is_active) then
    if auth.uid() is not null and coalesce(v_is_super, false) = false then
      raise exception 'Seul un super_admin peut modifier le statut d''un super_admin';
    end if;

    if (new.status <> 'active' or new.deleted_at is not null or new.is_active = false)
       and public.count_active_super_admins() <= 1 then
      raise exception 'Impossible de désactiver le dernier super_admin actif';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_super_admin_status on public.profiles;
create trigger protect_super_admin_status
before update on public.profiles
for each row execute function public.protect_super_admin_status();
