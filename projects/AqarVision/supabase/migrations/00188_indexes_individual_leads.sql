-- Performance indexes for individual listings and leads aggregation

-- Individual listings: filter by owner
CREATE INDEX IF NOT EXISTS idx_listings_individual_owner
  ON public.listings (individual_owner_id)
  WHERE individual_owner_id IS NOT NULL AND deleted_at IS NULL;

-- Leads: monthly stats per agency
CREATE INDEX IF NOT EXISTS idx_leads_agency_created
  ON public.leads (agency_id, created_at DESC);

-- Listings: common filter (agency + status + not deleted)
CREATE INDEX IF NOT EXISTS idx_listings_agency_status_active
  ON public.listings (agency_id, current_status)
  WHERE deleted_at IS NULL;
