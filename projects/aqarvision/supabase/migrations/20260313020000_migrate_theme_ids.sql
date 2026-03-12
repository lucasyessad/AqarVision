-- ============================================================================
-- Migrate old theme IDs to new structural theme system
-- Old: classic, modern, luxury, natural, minimal, bold
-- New: minimal, modern, professional, editorial, premium, luxury, bold
-- ============================================================================

-- Map old theme IDs to new ones
UPDATE public.agencies SET theme = 'modern'  WHERE theme = 'classic';
UPDATE public.agencies SET theme = 'minimal' WHERE theme = 'natural';
-- 'modern', 'luxury', 'bold' stay the same
-- 'minimal' stays the same
-- 'custom' stays the same

-- Update default from 'classic' to 'modern'
ALTER TABLE public.agencies ALTER COLUMN theme SET DEFAULT 'modern';

-- Add a CHECK constraint to enforce valid theme IDs
-- (won't block 'custom' or future themes — just prevents garbage values)
ALTER TABLE public.agencies DROP CONSTRAINT IF EXISTS agencies_theme_check;
ALTER TABLE public.agencies ADD CONSTRAINT agencies_theme_check
  CHECK (theme IN ('minimal', 'modern', 'professional', 'editorial', 'premium', 'luxury', 'bold', 'custom'));
