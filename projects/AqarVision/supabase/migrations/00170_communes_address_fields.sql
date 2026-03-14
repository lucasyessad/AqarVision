-- Migration: add address fields to communes
alter table public.communes
  add column if not exists postal_code text,
  add column if not exists daira_name_fr text,
  add column if not exists daira_name_ar text;

comment on column public.communes.postal_code is '5-digit Algerian postal code (e.g. 16000)';
comment on column public.communes.daira_name_fr is 'Daira (district) name in French';
comment on column public.communes.daira_name_ar is 'Daira (district) name in Arabic';
