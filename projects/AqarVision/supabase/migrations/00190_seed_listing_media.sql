-- Seed: Add placeholder photos to all agency listings that have no media
-- Uses Unsplash source URLs (free, no auth needed) for realistic real estate photos

-- Apartment photos
INSERT INTO public.listing_media (listing_id, storage_path, content_type, is_cover, sort_order)
SELECT l.id,
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
  'image/jpeg', true, 0
FROM public.listings l
LEFT JOIN public.listing_media lm ON lm.listing_id = l.id
WHERE lm.id IS NULL AND l.property_type = 'apartment' AND l.id LIKE 'b0000000%';

-- Second photo for apartments
INSERT INTO public.listing_media (listing_id, storage_path, content_type, is_cover, sort_order)
SELECT l.id,
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
  'image/jpeg', false, 1
FROM public.listings l
LEFT JOIN public.listing_media lm ON lm.listing_id = l.id AND lm.sort_order = 1
WHERE lm.id IS NULL AND l.property_type = 'apartment' AND l.id LIKE 'b0000000%';

-- Villa photos
INSERT INTO public.listing_media (listing_id, storage_path, content_type, is_cover, sort_order)
SELECT l.id,
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
  'image/jpeg', true, 0
FROM public.listings l
LEFT JOIN public.listing_media lm ON lm.listing_id = l.id
WHERE lm.id IS NULL AND l.property_type = 'villa' AND l.id LIKE 'b0000000%';

INSERT INTO public.listing_media (listing_id, storage_path, content_type, is_cover, sort_order)
SELECT l.id,
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
  'image/jpeg', false, 1
FROM public.listings l
LEFT JOIN public.listing_media lm ON lm.listing_id = l.id AND lm.sort_order = 1
WHERE lm.id IS NULL AND l.property_type = 'villa' AND l.id LIKE 'b0000000%';

-- Terrain photos
INSERT INTO public.listing_media (listing_id, storage_path, content_type, is_cover, sort_order)
SELECT l.id,
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
  'image/jpeg', true, 0
FROM public.listings l
LEFT JOIN public.listing_media lm ON lm.listing_id = l.id
WHERE lm.id IS NULL AND l.property_type = 'terrain' AND l.id LIKE 'b0000000%';

-- Commercial / Office photos
INSERT INTO public.listing_media (listing_id, storage_path, content_type, is_cover, sort_order)
SELECT l.id,
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
  'image/jpeg', true, 0
FROM public.listings l
LEFT JOIN public.listing_media lm ON lm.listing_id = l.id
WHERE lm.id IS NULL AND l.property_type IN ('commercial', 'office') AND l.id LIKE 'b0000000%';

-- Warehouse photos
INSERT INTO public.listing_media (listing_id, storage_path, content_type, is_cover, sort_order)
SELECT l.id,
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop',
  'image/jpeg', true, 0
FROM public.listings l
LEFT JOIN public.listing_media lm ON lm.listing_id = l.id
WHERE lm.id IS NULL AND l.property_type = 'warehouse' AND l.id LIKE 'b0000000%';
