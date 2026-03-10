-- =============================================================================
-- AqarVision - Complete Database Schema
-- =============================================================================
-- Plateforme SaaS immobilière multi-agences pour le marché algérien
--
-- Usage: Execute this script on a fresh Supabase database to create all tables.
-- Order: tables are created respecting foreign key dependencies.
--
-- Tables (11):
--   1. agencies            — Agences immobilières
--   2. agency_members      — Membres/agents d'une agence
--   3. properties          — Biens immobiliers
--   4. leads               — Contacts/demandes reçues
--   5. lead_notes          — Notes internes sur les leads
--   6. favorites           — Biens favoris des visiteurs
--   7. property_views      — Statistiques de vues par bien
--   8. analytics_events    — Événements analytics (visites, clics)
--   9. subscriptions       — Abonnements et facturation
--  10. notifications       — Notifications internes
--  11. media               — Gestion centralisée des fichiers/images
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. AGENCIES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE agencies (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT,
  logo_url         TEXT,
  cover_image_url  TEXT,
  primary_color    TEXT NOT NULL DEFAULT '#2563EB',
  phone            TEXT,
  email            TEXT,
  website          TEXT,
  address          TEXT,
  wilaya           TEXT,
  slogan           TEXT,
  registre_commerce TEXT,
  active_plan      TEXT NOT NULL DEFAULT 'starter',
  locale           TEXT NOT NULL DEFAULT 'fr',
  custom_domain    TEXT UNIQUE,

  -- Geolocation
  latitude         NUMERIC,
  longitude        NUMERIC,

  -- Social Media
  instagram_url    TEXT,
  facebook_url     TEXT,
  tiktok_url       TEXT,

  -- Luxury Branding (Enterprise)
  secondary_color       TEXT,
  hero_video_url        TEXT,
  hero_style            TEXT NOT NULL DEFAULT 'cover',
  font_style            TEXT NOT NULL DEFAULT 'elegant',
  theme_mode            TEXT NOT NULL DEFAULT 'dark',
  tagline               TEXT,
  stats_years           INTEGER,
  stats_properties_sold INTEGER,
  stats_clients         INTEGER,

  -- Timestamps
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT chk_active_plan CHECK (active_plan IN ('starter', 'pro', 'enterprise')),
  CONSTRAINT chk_locale      CHECK (locale IN ('fr', 'ar')),
  CONSTRAINT chk_hero_style  CHECK (hero_style IN ('color', 'cover', 'video')),
  CONSTRAINT chk_font_style  CHECK (font_style IN ('modern', 'classic', 'elegant')),
  CONSTRAINT chk_theme_mode  CHECK (theme_mode IN ('light', 'dark')),
  CONSTRAINT chk_stats_years           CHECK (stats_years IS NULL OR stats_years >= 0),
  CONSTRAINT chk_stats_properties_sold CHECK (stats_properties_sold IS NULL OR stats_properties_sold >= 0),
  CONSTRAINT chk_stats_clients         CHECK (stats_clients IS NULL OR stats_clients >= 0)
);

CREATE UNIQUE INDEX idx_agencies_slug          ON agencies(slug);
CREATE UNIQUE INDEX idx_agencies_custom_domain ON agencies(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX idx_agencies_owner_id             ON agencies(owner_id);
CREATE INDEX idx_agencies_active_plan          ON agencies(active_plan);
CREATE INDEX idx_agencies_wilaya               ON agencies(wilaya);

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view agencies"
  ON agencies FOR SELECT
  USING (true);

CREATE POLICY "Owners can update own agency"
  ON agencies FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create agency"
  ON agencies FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete own agency"
  ON agencies FOR DELETE
  USING (owner_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. AGENCY MEMBERS
-- ─────────────────────────────────────────────────────────────────────────────
-- Membres/agents d'une agence avec rôles (admin, agent, viewer)

CREATE TABLE agency_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id  UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'agent',
  full_name  TEXT,
  phone      TEXT,
  email      TEXT,
  avatar_url TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at  TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_member_role CHECK (role IN ('admin', 'agent', 'viewer')),
  CONSTRAINT uq_agency_member UNIQUE (agency_id, user_id)
);

CREATE INDEX idx_agency_members_agency_id ON agency_members(agency_id);
CREATE INDEX idx_agency_members_user_id   ON agency_members(user_id);

ALTER TABLE agency_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own agency members"
  ON agency_members FOR SELECT
  USING (
    agency_id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid())
    OR agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
  );

CREATE POLICY "Agency owners and admins can manage members"
  ON agency_members FOR ALL
  USING (
    agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
    OR agency_id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid() AND role = 'admin')
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. PROPERTIES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE properties (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id        UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  price            NUMERIC NOT NULL,
  surface          NUMERIC,
  rooms            INTEGER,
  bathrooms        INTEGER,
  type             TEXT,
  transaction_type TEXT NOT NULL DEFAULT 'sale',
  status           TEXT NOT NULL DEFAULT 'active',
  wilaya           TEXT,
  commune          TEXT,
  address          TEXT,
  images           TEXT[] NOT NULL DEFAULT '{}',
  features         TEXT[] NOT NULL DEFAULT '{}',
  latitude         NUMERIC,
  longitude        NUMERIC,
  is_featured      BOOLEAN NOT NULL DEFAULT false,
  views_count      INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at     TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT chk_transaction_type  CHECK (transaction_type IN ('sale', 'rent')),
  CONSTRAINT chk_property_status   CHECK (status IN ('draft', 'active', 'sold', 'rented', 'archived')),
  CONSTRAINT chk_price_positive    CHECK (price >= 0),
  CONSTRAINT chk_surface_positive  CHECK (surface IS NULL OR surface >= 0),
  CONSTRAINT chk_rooms_positive    CHECK (rooms IS NULL OR rooms >= 0),
  CONSTRAINT chk_bathrooms_positive CHECK (bathrooms IS NULL OR bathrooms >= 0)
);

CREATE INDEX idx_properties_agency_id        ON properties(agency_id);
CREATE INDEX idx_properties_transaction_type  ON properties(transaction_type);
CREATE INDEX idx_properties_status            ON properties(status);
CREATE INDEX idx_properties_wilaya            ON properties(wilaya);
CREATE INDEX idx_properties_type              ON properties(type);
CREATE INDEX idx_properties_price             ON properties(price);
CREATE INDEX idx_properties_is_featured       ON properties(is_featured) WHERE is_featured = true;
CREATE INDEX idx_properties_created_at        ON properties(created_at DESC);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active properties"
  ON properties FOR SELECT
  USING (status = 'active' OR agency_id IN (
    SELECT id FROM agencies WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Agency members can manage properties"
  ON properties FOR ALL
  USING (
    agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
    OR agency_id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid() AND role IN ('admin', 'agent'))
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. LEADS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE leads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id    UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  property_id  UUID REFERENCES properties(id) ON DELETE SET NULL,
  assigned_to  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  phone        TEXT NOT NULL,
  email        TEXT,
  message      TEXT,
  source       TEXT NOT NULL DEFAULT 'contact_form',
  status       TEXT NOT NULL DEFAULT 'new',
  priority     TEXT NOT NULL DEFAULT 'normal',
  budget_min   NUMERIC,
  budget_max   NUMERIC,
  desired_wilaya TEXT,
  desired_type TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  contacted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT chk_lead_source       CHECK (source IN ('contact_form', 'property_detail', 'whatsapp', 'phone', 'walk_in', 'referral')),
  CONSTRAINT chk_lead_status       CHECK (status IN ('new', 'contacted', 'qualified', 'negotiation', 'converted', 'lost')),
  CONSTRAINT chk_lead_priority     CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  CONSTRAINT chk_lead_name_length  CHECK (char_length(name) >= 2),
  CONSTRAINT chk_lead_phone_length CHECK (char_length(phone) >= 9)
);

CREATE INDEX idx_leads_agency_id   ON leads(agency_id);
CREATE INDEX idx_leads_status      ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_created_at  ON leads(created_at DESC);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency members can view own leads"
  ON leads FOR SELECT
  USING (
    agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
    OR agency_id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Agency members can manage leads"
  ON leads FOR ALL
  USING (
    agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
    OR agency_id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid() AND role IN ('admin', 'agent'))
  );

CREATE POLICY "Public can insert leads"
  ON leads FOR INSERT
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. LEAD NOTES
-- ─────────────────────────────────────────────────────────────────────────────
-- Notes internes et historique de suivi des leads

CREATE TABLE lead_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id    UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_notes_lead_id ON lead_notes(lead_id);

ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency members can manage lead notes"
  ON lead_notes FOR ALL
  USING (
    lead_id IN (
      SELECT l.id FROM leads l
      JOIN agencies a ON l.agency_id = a.id
      LEFT JOIN agency_members am ON am.agency_id = a.id
      WHERE a.owner_id = auth.uid() OR am.user_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. FAVORITES
-- ─────────────────────────────────────────────────────────────────────────────
-- Biens favoris sauvegardés par les visiteurs connectés

CREATE TABLE favorites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_favorite UNIQUE (user_id, property_id)
);

CREATE INDEX idx_favorites_user_id     ON favorites(user_id);
CREATE INDEX idx_favorites_property_id ON favorites(property_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. PROPERTY VIEWS
-- ─────────────────────────────────────────────────────────────────────────────
-- Tracking des vues par bien (agrégé par jour pour les analytics)

CREATE TABLE property_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  agency_id   UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  viewer_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash     TEXT,
  user_agent  TEXT,
  referrer    TEXT,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_property_views_property_id ON property_views(property_id);
CREATE INDEX idx_property_views_agency_id   ON property_views(agency_id);
CREATE INDEX idx_property_views_viewed_at   ON property_views(viewed_at DESC);

ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency members can view own property views"
  ON property_views FOR SELECT
  USING (
    agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
    OR agency_id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Public can insert property views"
  ON property_views FOR INSERT
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. ANALYTICS EVENTS
-- ─────────────────────────────────────────────────────────────────────────────
-- Événements analytics génériques (visites pages, clics CTA, etc.)

CREATE TABLE analytics_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id  UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  page_url   TEXT,
  ip_hash    TEXT,
  user_agent TEXT,
  referrer   TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_event_type CHECK (event_type IN (
    'page_view', 'property_click', 'contact_click', 'phone_click',
    'whatsapp_click', 'share_click', 'map_click', 'gallery_view',
    'search', 'filter_change', 'lead_submit'
  ))
);

CREATE INDEX idx_analytics_agency_id   ON analytics_events(agency_id);
CREATE INDEX idx_analytics_event_type  ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at  ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_session_id  ON analytics_events(session_id);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency members can view own analytics"
  ON analytics_events FOR SELECT
  USING (
    agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
    OR agency_id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Public can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. SUBSCRIPTIONS
-- ─────────────────────────────────────────────────────────────────────────────
-- Gestion des abonnements et facturation

CREATE TABLE subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id         UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  plan              TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'active',
  price_dzd         NUMERIC NOT NULL,
  billing_cycle     TEXT NOT NULL DEFAULT 'monthly',
  payment_method    TEXT,
  payment_reference TEXT,
  starts_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at           TIMESTAMPTZ,
  trial_ends_at     TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_sub_plan    CHECK (plan IN ('starter', 'pro', 'enterprise')),
  CONSTRAINT chk_sub_status  CHECK (status IN ('trial', 'active', 'past_due', 'cancelled', 'expired')),
  CONSTRAINT chk_sub_cycle   CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
  CONSTRAINT chk_sub_payment CHECK (payment_method IS NULL OR payment_method IN ('ccp', 'baridi_mob', 'virement', 'cash', 'dahabia'))
);

CREATE INDEX idx_subscriptions_agency_id ON subscriptions(agency_id);
CREATE INDEX idx_subscriptions_status    ON subscriptions(status);
CREATE INDEX idx_subscriptions_ends_at   ON subscriptions(ends_at);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency owners can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

-- Seul le backend (service_role) peut insérer/modifier les abonnements
-- Pas de policy INSERT/UPDATE pour les utilisateurs normaux


-- ─────────────────────────────────────────────────────────────────────────────
-- 10. NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────────
-- Notifications internes (nouveau lead, abonnement, etc.)

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id  UUID REFERENCES agencies(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  data       JSONB DEFAULT '{}',
  is_read    BOOLEAN NOT NULL DEFAULT false,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_notif_type CHECK (type IN (
    'new_lead', 'lead_assigned', 'lead_status_change',
    'subscription_expiring', 'subscription_expired', 'subscription_renewed',
    'property_published', 'property_view_milestone',
    'member_invited', 'member_joined',
    'system'
  ))
);

CREATE INDEX idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX idx_notifications_agency_id  ON notifications(agency_id);
CREATE INDEX idx_notifications_is_read    ON notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────────
-- 11. MEDIA
-- ─────────────────────────────────────────────────────────────────────────────
-- Gestion centralisée des fichiers/images uploadés

CREATE TABLE media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id   UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name   TEXT NOT NULL,
  file_path   TEXT NOT NULL,
  file_size   INTEGER NOT NULL,
  mime_type   TEXT NOT NULL,
  width       INTEGER,
  height      INTEGER,
  alt_text    TEXT,
  category    TEXT NOT NULL DEFAULT 'property',
  public_url  TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_media_category CHECK (category IN ('property', 'branding', 'avatar', 'document')),
  CONSTRAINT chk_file_size      CHECK (file_size > 0)
);

CREATE INDEX idx_media_agency_id  ON media(agency_id);
CREATE INDEX idx_media_category   ON media(category);
CREATE INDEX idx_media_created_at ON media(created_at DESC);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view media"
  ON media FOR SELECT
  USING (true);

CREATE POLICY "Agency members can manage media"
  ON media FOR ALL
  USING (
    agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
    OR agency_id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid() AND role IN ('admin', 'agent'))
  );


-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agencies_updated_at     BEFORE UPDATE ON agencies     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_properties_updated_at   BEFORE UPDATE ON properties   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_leads_updated_at        BEFORE UPDATE ON leads        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_agency_members_updated_at BEFORE UPDATE ON agency_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================
-- Execute in Supabase Dashboard or via CLI:
--
--   INSERT INTO storage.buckets (id, name, public) VALUES ('public', 'public', true);
--
-- File paths:
--   agencies/{agency_id}/branding/cover.{ext}   — Cover images
--   agencies/{agency_id}/branding/logo.{ext}     — Logos
--   agencies/{agency_id}/properties/{prop_id}/   — Property images
--   agencies/{agency_id}/avatars/{user_id}.{ext} — Member avatars
--   agencies/{agency_id}/documents/              — Documents
