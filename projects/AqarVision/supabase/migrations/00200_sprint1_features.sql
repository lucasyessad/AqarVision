-- Sprint 1 MVP — Feature tables and alterations
-- Features: search_alerts (1.2), verifications (3.1), listing_price_history (2.5 prep),
--           favorites enhancements (4.2), leads enhancements (6.3), listings quality (6.1)

-- ─── search_alerts (Feature 1.2 — Fine-grained alerts) ──────────────────────

CREATE TABLE IF NOT EXISTS search_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  filters JSONB NOT NULL DEFAULT '{}',
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('instant', 'daily', 'weekly')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_search_alerts_user ON search_alerts(user_id) WHERE is_active = true;

ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own alerts"
  ON search_alerts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── verifications (Feature 3.1 — Trust badges) ─────────────────────────────

CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 4),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  legal_name TEXT,
  rc_number TEXT,
  document_url TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agency_id, level)
);

CREATE INDEX idx_verifications_agency ON verifications(agency_id);
CREATE INDEX idx_verifications_status ON verifications(status) WHERE status = 'pending';

ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency members read own verifications"
  ON verifications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM agency_memberships
    WHERE agency_memberships.agency_id = verifications.agency_id
    AND agency_memberships.user_id = auth.uid()
    AND agency_memberships.is_active = true
  ));

CREATE POLICY "Super admins manage verifications"
  ON verifications FOR ALL
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- ─── listing_price_history (Feature 2.5 prep — Price history) ────────────────

CREATE TABLE IF NOT EXISTS listing_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  old_price BIGINT NOT NULL,
  new_price BIGINT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_price_history_listing ON listing_price_history(listing_id, created_at DESC);

ALTER TABLE listing_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency members read price history"
  ON listing_price_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM listings l
    JOIN agency_memberships am ON am.agency_id = l.agency_id
    WHERE l.id = listing_price_history.listing_id
    AND am.user_id = auth.uid()
    AND am.is_active = true
  ));

-- Trigger: auto-record price changes
CREATE OR REPLACE FUNCTION record_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.current_price IS DISTINCT FROM NEW.current_price THEN
    INSERT INTO listing_price_history (listing_id, old_price, new_price, changed_by)
    VALUES (NEW.id, OLD.current_price, NEW.current_price, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_record_price_change ON listings;
CREATE TRIGGER trg_record_price_change
  AFTER UPDATE OF current_price ON listings
  FOR EACH ROW
  EXECUTE FUNCTION record_price_change();

-- ─── ALTER favorites (Feature 4.2 — Notes on favorites) ─────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'favorites' AND column_name = 'note') THEN
    ALTER TABLE favorites ADD COLUMN note TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'favorites' AND column_name = 'personal_status') THEN
    ALTER TABLE favorites ADD COLUMN personal_status TEXT DEFAULT 'none' CHECK (personal_status IN ('none', 'interested', 'visited', 'negotiating', 'rejected'));
  END IF;
END $$;

-- ─── ALTER leads (Feature 6.3 — Lead qualification) ─────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'heat_score') THEN
    ALTER TABLE leads ADD COLUMN heat_score INTEGER DEFAULT 0 CHECK (heat_score BETWEEN 0 AND 100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'lead_type') THEN
    ALTER TABLE leads ADD COLUMN lead_type TEXT DEFAULT 'info' CHECK (lead_type IN ('info', 'visit', 'offer', 'urgent'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'next_action') THEN
    ALTER TABLE leads ADD COLUMN next_action TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'next_action_date') THEN
    ALTER TABLE leads ADD COLUMN next_action_date TIMESTAMPTZ;
  END IF;
END $$;

-- ─── ALTER listings (Features 6.1, 2.1 — Quality score, AI summary) ─────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'quality_score') THEN
    ALTER TABLE listings ADD COLUMN quality_score INTEGER DEFAULT 0 CHECK (quality_score BETWEEN 0 AND 100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'ai_summary') THEN
    ALTER TABLE listings ADD COLUMN ai_summary TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'availability_confirmed_at') THEN
    ALTER TABLE listings ADD COLUMN availability_confirmed_at TIMESTAMPTZ;
  END IF;
END $$;
