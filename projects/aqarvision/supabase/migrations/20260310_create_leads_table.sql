-- Migration: Create leads table for contact form submissions
-- Date: 2026-03-10

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  source TEXT NOT NULL DEFAULT 'contact_form',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_lead_source CHECK (source IN ('contact_form', 'property_detail', 'whatsapp')),
  CONSTRAINT chk_lead_name_length CHECK (char_length(name) >= 2),
  CONSTRAINT chk_lead_phone_length CHECK (char_length(phone) >= 9)
);

-- Index for fast lookup by agency
CREATE INDEX idx_leads_agency_id ON leads(agency_id);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- RLS: agencies can only see their own leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agencies can view own leads"
  ON leads FOR SELECT
  USING (agency_id IN (
    SELECT id FROM agencies WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Public can insert leads"
  ON leads FOR INSERT
  WITH CHECK (true);
