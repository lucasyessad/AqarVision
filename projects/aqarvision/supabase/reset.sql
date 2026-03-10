-- =============================================================================
-- AqarVision - Database Reset
-- =============================================================================
-- WARNING: This script DROPS all application tables, functions, and triggers.
-- Execute this BEFORE schema.sql to start fresh.
-- =============================================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS property_views CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS lead_notes CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS agency_members CASCADE;
DROP TABLE IF EXISTS agencies CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
