-- M01 Auth & Identity — Functions
-- Utility functions and trigger handlers

-- ──────────────────────────────────────────────
-- is_agency_member(p_agency_id, p_user_id)
-- Returns true if the user is an active member of the agency.
-- ──────────────────────────────────────────────
create or replace function public.is_agency_member(p_agency_id uuid, p_user_id uuid)
  returns boolean
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select exists (
    select 1
    from public.agency_memberships am
    where am.agency_id = p_agency_id
      and am.user_id   = p_user_id
      and am.is_active  = true
  );
$$;

comment on function public.is_agency_member(uuid, uuid) is
  'Check whether a user is an active member of a given agency.';

-- ──────────────────────────────────────────────
-- is_agency_admin(p_agency_id, p_user_id)
-- Returns true if the user holds owner or admin role in the agency.
-- ──────────────────────────────────────────────
create or replace function public.is_agency_admin(p_agency_id uuid, p_user_id uuid)
  returns boolean
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select exists (
    select 1
    from public.agency_memberships am
    where am.agency_id = p_agency_id
      and am.user_id   = p_user_id
      and am.role in ('owner', 'admin')
      and am.is_active  = true
  );
$$;

comment on function public.is_agency_admin(uuid, uuid) is
  'Check whether a user is an owner or admin of a given agency.';

-- ──────────────────────────────────────────────
-- is_super_admin(p_user_id)
-- Returns true if the user has the super_admin role.
-- ──────────────────────────────────────────────
create or replace function public.is_super_admin(p_user_id uuid)
  returns boolean
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = p_user_id
      and p.role    = 'super_admin'
  );
$$;

comment on function public.is_super_admin(uuid) is
  'Check whether a user holds the super_admin role.';

-- ──────────────────────────────────────────────
-- update_updated_at()
-- Generic trigger function to set updated_at = now().
-- ──────────────────────────────────────────────
create or replace function public.update_updated_at()
  returns trigger
  language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.update_updated_at() is
  'Trigger function: sets updated_at to current timestamp on row update.';

-- ──────────────────────────────────────────────
-- handle_new_user()
-- Trigger function: auto-creates users + profiles rows
-- when a new row is inserted into auth.users.
-- ──────────────────────────────────────────────
create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  insert into public.users (id, created_at)
  values (new.id, now());

  insert into public.profiles (user_id, full_name, avatar_url, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null),
    now(),
    now()
  );

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Trigger function: creates a users row and a profiles row when a new auth user is created.';
