-- =============================================================================
-- AqarVision — Search Properties View
-- =============================================================================
-- This view is used by AqarSearch for public property search.
-- It joins properties and agencies, exposes enriched columns, and computes
-- a trust_score (0-100) based on agency and property completeness indicators.
-- Only active properties are included.
-- =============================================================================

CREATE OR REPLACE VIEW search_properties_view AS
SELECT
  -- Property identifiers & core fields
  p.id               AS property_id,
  p.title,
  p.description,
  p.price,
  p.currency,
  p.surface,
  p.rooms,
  p.bathrooms,
  p.type,
  p.transaction_type,
  p.country,
  p.city,
  p.wilaya,
  p.commune,
  p.address,
  p.images,
  p.features,
  p.latitude,
  p.longitude,
  p.is_featured,
  p.views_count,
  p.published_at,
  p.created_at,
  p.updated_at,

  -- Agency fields
  a.id               AS agency_id,
  a.name             AS agency_name,
  a.slug             AS agency_slug,
  a.active_plan      AS agency_plan,
  a.logo_url         AS agency_logo_url,
  a.phone            AS agency_phone,
  a.email            AS agency_email,
  a.wilaya           AS agency_wilaya,

  -- Derived: media counts and boolean flags
  array_length(p.images, 1)                                      AS images_count,
  (p.latitude IS NOT NULL AND p.longitude IS NOT NULL)           AS has_location,
  (p.description IS NOT NULL AND char_length(p.description) > 10) AS has_description,
  (array_length(p.features, 1) > 0)                              AS has_features,

  -- Trust score (0-100): weighted completeness of agency + property data
  (
    -- Agency completeness
    CASE WHEN a.logo_url          IS NOT NULL THEN 10 ELSE 0 END  -- Agency has logo
    + CASE WHEN a.phone           IS NOT NULL THEN 10 ELSE 0 END  -- Agency has phone
    + CASE WHEN a.email           IS NOT NULL THEN 10 ELSE 0 END  -- Agency has email
    + CASE WHEN a.description     IS NOT NULL THEN 10 ELSE 0 END  -- Agency has description
    + CASE WHEN a.registre_commerce IS NOT NULL THEN 15 ELSE 0 END -- Agency has registre_commerce
    -- Property completeness
    + CASE WHEN array_length(p.images, 1) >= 1 THEN 15 ELSE 0 END -- At least 1 image
    + CASE WHEN array_length(p.images, 1) >= 3 THEN 10 ELSE 0 END -- At least 3 images
    + CASE WHEN p.description IS NOT NULL AND char_length(p.description) > 10 THEN 10 ELSE 0 END -- Has description
    + CASE WHEN p.latitude IS NOT NULL AND p.longitude IS NOT NULL THEN 10 ELSE 0 END            -- Has GPS coords
  )::INTEGER                                                      AS trust_score

FROM properties p
JOIN agencies   a ON p.agency_id = a.id
WHERE p.status = 'active';
