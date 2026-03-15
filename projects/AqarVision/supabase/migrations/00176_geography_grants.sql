-- Grant read access on geography tables to anon and authenticated roles.
-- These are public reference tables (no PII) so they should be readable by everyone.
grant select on public.wilayas  to anon, authenticated;
grant select on public.communes to anon, authenticated;
