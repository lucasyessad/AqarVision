-- Migration: Add luxury branding fields for Enterprise agencies
-- Date: 2026-03-10
-- Description: Adds 9 new columns to the agencies table for the luxury branding system

ALTER TABLE agencies ADD COLUMN secondary_color TEXT;
ALTER TABLE agencies ADD COLUMN hero_video_url TEXT;
ALTER TABLE agencies ADD COLUMN hero_style TEXT NOT NULL DEFAULT 'cover';
ALTER TABLE agencies ADD COLUMN font_style TEXT NOT NULL DEFAULT 'elegant';
ALTER TABLE agencies ADD COLUMN theme_mode TEXT NOT NULL DEFAULT 'dark';
ALTER TABLE agencies ADD COLUMN tagline TEXT;
ALTER TABLE agencies ADD COLUMN stats_years INTEGER;
ALTER TABLE agencies ADD COLUMN stats_properties_sold INTEGER;
ALTER TABLE agencies ADD COLUMN stats_clients INTEGER;

-- Constraints: enum validation
ALTER TABLE agencies ADD CONSTRAINT chk_hero_style
  CHECK (hero_style IN ('color', 'cover', 'video'));

ALTER TABLE agencies ADD CONSTRAINT chk_font_style
  CHECK (font_style IN ('modern', 'classic', 'elegant'));

ALTER TABLE agencies ADD CONSTRAINT chk_theme_mode
  CHECK (theme_mode IN ('light', 'dark'));

-- Constraints: stats must be non-negative
ALTER TABLE agencies ADD CONSTRAINT chk_stats_years
  CHECK (stats_years IS NULL OR stats_years >= 0);

ALTER TABLE agencies ADD CONSTRAINT chk_stats_properties_sold
  CHECK (stats_properties_sold IS NULL OR stats_properties_sold >= 0);

ALTER TABLE agencies ADD CONSTRAINT chk_stats_clients
  CHECK (stats_clients IS NULL OR stats_clients >= 0);
