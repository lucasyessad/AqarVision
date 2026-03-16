-- 00191 — Extended RLS for individual listing owners
-- Grants individual owners access to leads, conversations, and messages
-- related to their listings.
-- Verified against 00040_marketplace.sql schema:
--   leads.listing_id, leads.agency_id, leads.sender_user_id
--   conversations.lead_id
--   messages.conversation_id

-- ── leads ───────────────────────────────────────────────────────────────

-- Individual owners can view leads on their listings
CREATE POLICY leads_select_individual ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = leads.listing_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

-- ── conversations ───────────────────────────────────────────────────────

-- Individual owners can view conversations on their listings
CREATE POLICY conversations_select_individual ON public.conversations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads ld
      JOIN public.listings l ON l.id = ld.listing_id
      WHERE ld.id = conversations.lead_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

-- ── messages ────────────────────────────────────────────────────────────

-- Individual owners can view messages in their conversations
CREATE POLICY messages_select_individual ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.leads ld ON ld.id = c.lead_id
      JOIN public.listings l ON l.id = ld.listing_id
      WHERE c.id = messages.conversation_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );

-- Individual owners can send messages in their conversations
CREATE POLICY messages_insert_individual ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.leads ld ON ld.id = c.lead_id
      JOIN public.listings l ON l.id = ld.listing_id
      WHERE c.id = messages.conversation_id
        AND l.owner_type = 'individual'
        AND l.individual_owner_id = auth.uid()
    )
  );
