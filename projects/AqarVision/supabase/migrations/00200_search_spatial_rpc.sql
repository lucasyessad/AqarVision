-- Search listings within a polygon (draw-to-search) or bounding box.
-- Called from the Next.js search service via supabase.rpc().
--
-- Usage:
--   SELECT * FROM search_listings_in_polygon(
--     polygon_wkt := 'POLYGON((2.9 36.7, 3.1 36.7, 3.1 36.8, 2.9 36.8, 2.9 36.7))',
--     p_status := 'published',
--     p_limit  := 100
--   );

CREATE OR REPLACE FUNCTION search_listings_in_polygon(
  polygon_wkt text,
  p_status text DEFAULT 'published',
  p_limit int DEFAULT 100,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  lat double precision,
  lng double precision
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    l.id,
    ST_Y(l.location::geometry) AS lat,
    ST_X(l.location::geometry) AS lng
  FROM listings l
  WHERE l.location IS NOT NULL
    AND l.current_status = p_status
    AND l.deleted_at IS NULL
    AND ST_Within(
      l.location::geometry,
      ST_GeomFromText(polygon_wkt, 4326)
    )
  ORDER BY l.published_at DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
$$;

-- Also expose a simpler function to get coordinates for listing IDs
-- (used to enrich search results with lat/lng after main query).
CREATE OR REPLACE FUNCTION get_listing_coordinates(listing_ids uuid[])
RETURNS TABLE (
  id uuid,
  lat double precision,
  lng double precision
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    l.id,
    ST_Y(l.location::geometry) AS lat,
    ST_X(l.location::geometry) AS lng
  FROM listings l
  WHERE l.id = ANY(listing_ids)
    AND l.location IS NOT NULL;
$$;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION search_listings_in_polygon TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_listing_coordinates TO anon, authenticated;
