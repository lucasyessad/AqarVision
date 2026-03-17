-- ============================================================================
-- 007 — Leads, Messaging & Visit Requests
-- leads, chatbot_leads, conversations, messages, visit_requests
-- Unified lead scoring: kept score (manual) + heat_score (computed)
-- ============================================================================

-- ── leads ───────────────────────────────────────────────────────────────────

create table public.leads (
  id               uuid primary key default gen_random_uuid(),
  listing_id       uuid not null references public.listings(id) on delete cascade,
  agency_id        uuid not null references public.agencies(id) on delete cascade,
  sender_user_id   uuid not null references public.users(id) on delete cascade,
  status           public.lead_status not null default 'new',
  source           text not null default 'platform'
    check (source in ('platform', 'whatsapp', 'phone', 'chatbot', 'email')),
  score            integer check (score between 0 and 100),
  notes            jsonb default '[]'::jsonb,
  heat_score       integer default 0 check (heat_score between 0 and 100),
  lead_type        text default 'info'
    check (lead_type in ('info', 'visit', 'offer', 'urgent')),
  next_action      text,
  next_action_date timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── chatbot_leads ───────────────────────────────────────────────────────────

create table public.chatbot_leads (
  id            uuid primary key default gen_random_uuid(),
  agency_id     uuid not null references public.agencies(id) on delete cascade,
  property_type text,
  budget        text,
  wilaya        text,
  contact_name  text,
  contact_phone text,
  contact_email text,
  user_id       uuid references public.users(id) on delete set null,
  source        text not null default 'chatbot' check (source = 'chatbot'),
  status        text not null default 'new'
    check (status in ('new', 'contacted', 'closed')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── conversations ───────────────────────────────────────────────────────────

create table public.conversations (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── messages ────────────────────────────────────────────────────────────────

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_user_id  uuid not null references public.users(id) on delete cascade,
  body            text not null,
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);

-- ── visit_requests ──────────────────────────────────────────────────────────

create table public.visit_requests (
  id             uuid primary key default gen_random_uuid(),
  listing_id     uuid references public.listings(id) on delete cascade,
  agency_id      uuid references public.agencies(id) on delete cascade,
  lead_id        uuid references public.leads(id) on delete set null,
  visitor_name   text not null,
  visitor_phone  text not null,
  visitor_email  text,
  message        text,
  requested_date date,
  status         text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'done')),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

comment on table public.visit_requests is
  'Visit scheduling requests submitted by prospective buyers/renters.';
