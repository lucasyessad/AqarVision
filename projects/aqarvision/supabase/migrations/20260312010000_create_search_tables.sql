-- =============================================================================
-- AqarVision — Search Tables
-- =============================================================================
-- Creates 3 user-facing search tables with RLS policies:
--   1. saved_searches   — named search filters saved by authenticated users
--   2. search_alerts    — notification channels/frequencies tied to saved searches
--   3. search_history   — lightweight log of past search queries per user
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. SAVED SEARCHES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS saved_searches (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  transaction_type TEXT,
  country          TEXT,
  wilaya           TEXT,
  commune          TEXT,
  city             TEXT,
  property_type    TEXT,
  price_min        NUMERIC,
  price_max        NUMERIC,
  surface_min      NUMERIC,
  surface_max      NUMERIC,
  rooms_min        INTEGER,
  features         TEXT[]      NOT NULL DEFAULT '{}',
  keywords         TEXT,
  is_active        BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_searches' AND policyname = 'Users can manage own saved_searches') THEN
    CREATE POLICY "Users can manage own saved_searches" ON saved_searches
      FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_searches' AND policyname = 'Users can insert own saved_searches') THEN
    CREATE POLICY "Users can insert own saved_searches" ON saved_searches
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_searches' AND policyname = 'Users can update own saved_searches') THEN
    CREATE POLICY "Users can update own saved_searches" ON saved_searches
      FOR UPDATE USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_searches' AND policyname = 'Users can delete own saved_searches') THEN
    CREATE POLICY "Users can delete own saved_searches" ON saved_searches
      FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_saved_searches_updated_at') THEN
    CREATE TRIGGER trg_saved_searches_updated_at
      BEFORE UPDATE ON saved_searches
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. SEARCH ALERTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS search_alerts (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_search_id  UUID        NOT NULL REFERENCES saved_searches(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel          TEXT        NOT NULL DEFAULT 'in_app',
  frequency        TEXT        NOT NULL DEFAULT 'daily',
  is_active        BOOLEAN     NOT NULL DEFAULT true,
  last_sent_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_alert_channel   CHECK (channel   IN ('in_app', 'email', 'both')),
  CONSTRAINT chk_alert_frequency CHECK (frequency IN ('instant', 'daily', 'weekly'))
);

CREATE INDEX IF NOT EXISTS idx_search_alerts_user_id         ON search_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_search_alerts_saved_search_id ON search_alerts(saved_search_id);

ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_alerts' AND policyname = 'Users can view own search_alerts') THEN
    CREATE POLICY "Users can view own search_alerts" ON search_alerts
      FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_alerts' AND policyname = 'Users can insert own search_alerts') THEN
    CREATE POLICY "Users can insert own search_alerts" ON search_alerts
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_alerts' AND policyname = 'Users can update own search_alerts') THEN
    CREATE POLICY "Users can update own search_alerts" ON search_alerts
      FOR UPDATE USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_alerts' AND policyname = 'Users can delete own search_alerts') THEN
    CREATE POLICY "Users can delete own search_alerts" ON search_alerts
      FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_search_alerts_updated_at') THEN
    CREATE TRIGGER trg_search_alerts_updated_at
      BEFORE UPDATE ON search_alerts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. SEARCH HISTORY
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS search_history (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query_text  TEXT,
  filters     JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id    ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_history' AND policyname = 'Users can view own search_history') THEN
    CREATE POLICY "Users can view own search_history" ON search_history
      FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_history' AND policyname = 'Users can insert own search_history') THEN
    CREATE POLICY "Users can insert own search_history" ON search_history
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_history' AND policyname = 'Users can delete own search_history') THEN
    CREATE POLICY "Users can delete own search_history" ON search_history
      FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;
