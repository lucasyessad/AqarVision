-- Dashboard preferences per agency
CREATE TABLE IF NOT EXISTS public.agency_dashboard_preferences (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id        uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE UNIQUE,
  widget_order     text[] NOT NULL DEFAULT ARRAY['stats', 'recent_leads', 'activity', 'visit_requests'],
  hidden_widgets   text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_prefs_agency ON public.agency_dashboard_preferences(agency_id);

ALTER TABLE public.agency_dashboard_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dashboard_prefs_select_owner" ON public.agency_dashboard_preferences
  FOR SELECT USING (
    agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid())
  );

CREATE POLICY "dashboard_prefs_all_owner" ON public.agency_dashboard_preferences
  FOR ALL USING (
    agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid())
  );
