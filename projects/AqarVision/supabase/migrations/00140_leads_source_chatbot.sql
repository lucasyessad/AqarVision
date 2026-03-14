-- M14 Chatbot leads & extend leads.source
--
-- 1. Extend leads.source CHECK to include 'chatbot' and 'email'.
-- 2. Create a new `chatbot_leads` table for anonymous chatbot inquiries
--    (no sender_user_id required — open to unauthenticated visitors).

-- ── 1. Extend leads.source ────────────────────────────────────────────────────

alter table public.leads
  drop constraint if exists leads_source_check;

alter table public.leads
  add constraint leads_source_check
  check (source in ('platform', 'whatsapp', 'phone', 'chatbot', 'email'));

comment on column public.leads.source is
  'Origin of the lead: platform | whatsapp | phone | chatbot | email';

-- ── 2. chatbot_leads (anonymous) ─────────────────────────────────────────────

create table public.chatbot_leads (
  id              uuid primary key default gen_random_uuid(),
  agency_id       uuid not null references public.agencies(id) on delete cascade,
  -- Visitor-provided data collected step by step
  property_type   text,                -- Step 1: type de bien
  budget          text,                -- Step 2: budget
  wilaya          text,                -- Step 3: wilaya souhaitée
  -- Contact info
  contact_name    text,
  contact_phone   text,
  contact_email   text,
  -- Optional: linked user if authenticated
  user_id         uuid references public.users(id) on delete set null,
  -- Metadata
  source          text not null default 'chatbot'
                    check (source = 'chatbot'),
  status          text not null default 'new'
                    check (status in ('new', 'contacted', 'closed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.chatbot_leads is
  'Anonymous leads collected via the agency storefront chatbot widget';

-- Index for agency dashboard queries
create index chatbot_leads_agency_id_created_at_idx
  on public.chatbot_leads (agency_id, created_at desc);

-- RLS: agencies can read their own chatbot leads; anyone can insert (anonymous)
alter table public.chatbot_leads enable row level security;

create policy "chatbot_leads_insert_anon"
  on public.chatbot_leads
  for insert
  with check (true);

create policy "chatbot_leads_select_agency"
  on public.chatbot_leads
  for select
  using (
    exists (
      select 1 from public.agency_memberships m
      where m.agency_id = chatbot_leads.agency_id
        and m.user_id = auth.uid()
    )
  );

-- updated_at trigger
create trigger chatbot_leads_updated_at
  before update on public.chatbot_leads
  for each row execute function public.update_updated_at();
