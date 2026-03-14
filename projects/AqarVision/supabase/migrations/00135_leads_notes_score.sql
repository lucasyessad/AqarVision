-- M06 Leads — Add notes (JSONB) and score columns to leads table

alter table public.leads
  add column if not exists score integer check (score >= 0 and score <= 100),
  add column if not exists notes jsonb not null default '[]'::jsonb;

comment on column public.leads.score is 'Lead quality score 0–100 (optional, set manually or by AI)';
comment on column public.leads.notes is 'Array of internal agency notes [{id, body, author_id, author_name, created_at}]';
