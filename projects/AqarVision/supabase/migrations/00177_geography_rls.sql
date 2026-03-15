-- Enable RLS on geography tables and add public read policies.
-- These are reference tables (no PII) — everyone can read them.

alter table public.wilayas  enable row level security;
alter table public.communes enable row level security;

create policy wilayas_public_read
  on public.wilayas for select
  using (true);

create policy communes_public_read
  on public.communes for select
  using (true);
