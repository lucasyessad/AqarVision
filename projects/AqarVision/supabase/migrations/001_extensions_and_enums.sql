-- ============================================================================
-- 001 — Extensions & Enums
-- All PostgreSQL extensions and domain enums for AqarVision
-- ============================================================================

-- Extensions
create extension if not exists "postgis";       -- geographic data types & spatial queries
create extension if not exists "btree_gist";    -- GiST index operator classes for exclusion constraints
create extension if not exists "pg_trgm";       -- trigram matching for fuzzy text search

-- ── Enums ───────────────────────────────────────────────────────────────────

create type public.user_role as enum (
  'end_user',
  'super_admin'
);

create type public.agency_role as enum (
  'owner',
  'admin',
  'agent',
  'editor',
  'viewer'
);

create type public.listing_status as enum (
  'draft',
  'pending_review',
  'published',
  'paused',
  'rejected',
  'sold',
  'rented',
  'expired',
  'archived'
);

create type public.listing_type as enum (
  'sale',
  'rent',
  'vacation'
);

create type public.property_type as enum (
  'apartment',
  'villa',
  'terrain',
  'commercial',
  'office',
  'building',
  'farm',
  'warehouse'
);

create type public.listing_owner_type as enum (
  'agency',
  'individual'
);

create type public.document_type as enum (
  'acte',
  'livret_foncier',
  'promesse',
  'cc'
);

create type public.lead_status as enum (
  'new',
  'contacted',
  'qualified',
  'closed'
);

create type public.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete'
);

create type public.moderation_action as enum (
  'approved',
  'rejected',
  'hidden',
  'restored'
);
