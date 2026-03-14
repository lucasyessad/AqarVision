-- Fix #1: RLS policies had reversed arguments for is_agency_member / is_agency_admin
-- Function signature: (p_agency_id uuid, p_user_id uuid)
-- Policies were calling: (auth.uid(), agency_id) — WRONG ORDER
-- Correct:              (agency_id, auth.uid())

-- Drop and recreate affected policies

-- agency_branches
drop policy if exists branches_modify_admin on public.agency_branches;
create policy branches_modify_admin
  on public.agency_branches
  for all
  using (public.is_agency_admin(agency_id, auth.uid()))
  with check (public.is_agency_admin(agency_id, auth.uid()));

-- agency_memberships
drop policy if exists memberships_select_member on public.agency_memberships;
create policy memberships_select_member
  on public.agency_memberships
  for select
  using (public.is_agency_member(agency_id, auth.uid()));

drop policy if exists memberships_modify_admin on public.agency_memberships;
create policy memberships_modify_admin
  on public.agency_memberships
  for all
  using (public.is_agency_admin(agency_id, auth.uid()))
  with check (public.is_agency_admin(agency_id, auth.uid()));

-- agencies update
drop policy if exists agencies_update_admin on public.agencies;
create policy agencies_update_admin
  on public.agencies
  for update
  using (public.is_agency_admin(id, auth.uid()) and deleted_at is null);

-- agency_invites (check the file for these too)
drop policy if exists invites_select_member on public.agency_invites;
create policy invites_select_member
  on public.agency_invites
  for select
  using (public.is_agency_member(agency_id, auth.uid()));

drop policy if exists invites_modify_admin on public.agency_invites;
create policy invites_modify_admin
  on public.agency_invites
  for all
  using (public.is_agency_admin(agency_id, auth.uid()))
  with check (public.is_agency_admin(agency_id, auth.uid()));

-- Fix #2: RPC to create agency + owner membership atomically (security definer bypasses RLS)
create or replace function public.create_agency_with_owner(
  p_name text,
  p_slug text,
  p_description text default null,
  p_phone text default null,
  p_email text default null
)
  returns uuid
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  v_user_id uuid;
  v_agency_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.agencies (name, slug, description, phone, email)
  values (p_name, p_slug, p_description, p_phone, p_email)
  returning id into v_agency_id;

  insert into public.agency_memberships (agency_id, user_id, role, is_active)
  values (v_agency_id, v_user_id, 'owner', true);

  return v_agency_id;
end;
$$;

comment on function public.create_agency_with_owner(text, text, text, text, text) is
  'Creates an agency and adds the current user as owner in a single transaction.';
