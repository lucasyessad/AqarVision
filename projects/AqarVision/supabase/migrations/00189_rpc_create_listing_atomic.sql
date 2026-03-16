-- Atomic listing creation: insert listing + price_version + status_version in one transaction.
-- Prevents orphaned records if any step fails.

CREATE OR REPLACE FUNCTION public.create_listing_atomic(
  p_agency_id uuid,
  p_individual_owner_id uuid,
  p_owner_type text,
  p_listing_type text,
  p_property_type text,
  p_wilaya_code text,
  p_commune_id bigint,
  p_surface_m2 numeric,
  p_rooms int,
  p_bathrooms int,
  p_current_price numeric,
  p_currency text,
  p_current_status text,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_listing_id uuid;
BEGIN
  -- Insert listing
  INSERT INTO public.listings (
    agency_id, individual_owner_id, owner_type,
    listing_type, property_type, wilaya_code, commune_id,
    surface_m2, rooms, bathrooms,
    current_price, currency, current_status, details,
    published_at
  ) VALUES (
    p_agency_id, p_individual_owner_id, p_owner_type::listing_owner_type,
    p_listing_type::listing_type, p_property_type::property_type, p_wilaya_code, p_commune_id,
    p_surface_m2, p_rooms, p_bathrooms,
    p_current_price, p_currency, p_current_status::listing_status, p_details,
    CASE WHEN p_current_status = 'published' THEN now() ELSE NULL END
  )
  RETURNING id INTO v_listing_id;

  -- Insert initial price version
  INSERT INTO public.listing_price_versions (
    listing_id, price, currency, changed_by, valid_from
  ) VALUES (
    v_listing_id, p_current_price, p_currency, auth.uid(), now()
  );

  -- Insert initial status version
  INSERT INTO public.listing_status_versions (
    listing_id, status, changed_by, valid_from
  ) VALUES (
    v_listing_id, p_current_status::listing_status, auth.uid(), now()
  );

  RETURN v_listing_id;
END;
$$;

-- Grant execute to authenticated users (RLS on listings table still applies for reads)
GRANT EXECUTE ON FUNCTION public.create_listing_atomic TO authenticated;


-- Atomic lead + conversation + message creation
CREATE OR REPLACE FUNCTION public.create_lead_with_message(
  p_agency_id uuid,
  p_listing_id uuid,
  p_sender_id uuid,
  p_message_text text,
  p_sender_name text DEFAULT NULL,
  p_sender_phone text DEFAULT NULL,
  p_sender_email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lead_id uuid;
  v_conversation_id uuid;
BEGIN
  -- Create lead
  INSERT INTO public.leads (
    agency_id, listing_id, contact_name, contact_phone, contact_email, status
  ) VALUES (
    p_agency_id, p_listing_id, p_sender_name, p_sender_phone, p_sender_email, 'new'
  )
  RETURNING id INTO v_lead_id;

  -- Create conversation
  INSERT INTO public.conversations (
    agency_id, listing_id, participant_ids
  ) VALUES (
    p_agency_id, p_listing_id, ARRAY[p_sender_id]
  )
  RETURNING id INTO v_conversation_id;

  -- Create first message
  INSERT INTO public.messages (
    conversation_id, sender_id, content
  ) VALUES (
    v_conversation_id, p_sender_id, p_message_text
  );

  RETURN jsonb_build_object(
    'lead_id', v_lead_id,
    'conversation_id', v_conversation_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_lead_with_message TO authenticated;
