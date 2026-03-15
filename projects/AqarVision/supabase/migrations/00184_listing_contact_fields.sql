-- Migration 00184: Add contact fields for individual listings
-- Allows individual owners to show their phone and control messaging preferences.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS show_phone boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS accept_messages boolean NOT NULL DEFAULT true;
