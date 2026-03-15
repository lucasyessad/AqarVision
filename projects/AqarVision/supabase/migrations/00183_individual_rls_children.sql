-- Migration 00183: Fix RLS for individual listing child tables
-- Without these policies, inserting listing_translations/media/versions for
-- individual-owned listings raises "violates row-level security policy".

-- ── listing_translations ──────────────────────────────────────────────

CREATE POLICY listing_translations_insert_individual
  ON public.listing_translations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

CREATE POLICY listing_translations_update_individual
  ON public.listing_translations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

CREATE POLICY listing_translations_select_individual
  ON public.listing_translations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

-- ── listing_media ─────────────────────────────────────────────────────

CREATE POLICY listing_media_insert_individual
  ON public.listing_media
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

CREATE POLICY listing_media_select_individual
  ON public.listing_media
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

CREATE POLICY listing_media_update_individual
  ON public.listing_media
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

CREATE POLICY listing_media_delete_individual
  ON public.listing_media
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

-- ── price_versions ────────────────────────────────────────────────────

CREATE POLICY price_versions_insert_individual
  ON public.listing_price_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

-- ── status_versions ───────────────────────────────────────────────────

CREATE POLICY status_versions_insert_individual
  ON public.listing_status_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

-- ── listings: select + update own individual listings ─────────────────

CREATE POLICY listings_select_own_individual
  ON public.listings
  FOR SELECT
  TO authenticated
  USING (
    owner_type = 'individual'
    AND individual_owner_id = auth.uid()
  );

CREATE POLICY listings_update_own_individual
  ON public.listings
  FOR UPDATE
  TO authenticated
  USING (
    owner_type = 'individual'
    AND individual_owner_id = auth.uid()
  )
  WITH CHECK (
    owner_type = 'individual'
    AND individual_owner_id = auth.uid()
  );
