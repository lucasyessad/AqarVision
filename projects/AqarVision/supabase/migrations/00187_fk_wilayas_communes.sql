-- Add foreign key constraints: listings & agency_branches → wilayas/communes
-- Ensures data integrity (no orphaned wilaya_code or commune_id)

ALTER TABLE public.listings
  ADD CONSTRAINT fk_listings_wilaya
  FOREIGN KEY (wilaya_code) REFERENCES public.wilayas(code) ON DELETE RESTRICT;

ALTER TABLE public.listings
  ADD CONSTRAINT fk_listings_commune
  FOREIGN KEY (commune_id) REFERENCES public.communes(id) ON DELETE RESTRICT;

ALTER TABLE public.agency_branches
  ADD CONSTRAINT fk_branches_wilaya
  FOREIGN KEY (wilaya_code) REFERENCES public.wilayas(code) ON DELETE RESTRICT;

ALTER TABLE public.agency_branches
  ADD CONSTRAINT fk_branches_commune
  FOREIGN KEY (commune_id) REFERENCES public.communes(id) ON DELETE RESTRICT;
