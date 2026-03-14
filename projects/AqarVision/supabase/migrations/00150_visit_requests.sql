-- M15 Visit Requests — Table for property visit scheduling

create table public.visit_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade,
  agency_id uuid references public.agencies(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  visitor_name text not null,
  visitor_phone text not null,
  visitor_email text,
  message text,
  requested_date date,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'done')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for agency lookups
create index visit_requests_agency_id_idx on public.visit_requests (agency_id);
create index visit_requests_listing_id_idx on public.visit_requests (listing_id);
create index visit_requests_status_idx on public.visit_requests (status);

-- RLS
alter table public.visit_requests enable row level security;

-- Agency members can view and modify their agency's visit requests
create policy visit_requests_agency_member on public.visit_requests
  for all
  using (public.is_agency_member(agency_id, auth.uid()))
  with check (public.is_agency_member(agency_id, auth.uid()));

-- Anyone (including anonymous visitors) can submit a visit request
create policy visit_requests_public_insert on public.visit_requests
  for insert
  with check (true);

-- Trigger to update updated_at
create trigger visit_requests_updated_at
  before update on public.visit_requests
  for each row
  execute function public.update_updated_at();

comment on table public.visit_requests is
  'Visit scheduling requests submitted by prospective buyers/renters for agency listings.';
