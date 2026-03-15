-- Migration 00185: Add extended listing detail columns
-- Supports the 7-step wizard: floor, year built, precise address, coordinates.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS floor integer,
  ADD COLUMN IF NOT EXISTS total_floors integer,
  ADD COLUMN IF NOT EXISTS year_built integer,
  ADD COLUMN IF NOT EXISTS address_text text;
