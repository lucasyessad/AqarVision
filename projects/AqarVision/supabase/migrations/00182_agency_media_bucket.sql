-- Migration: 00182_agency_media_bucket
-- Create the agency-media storage bucket and RLS policies

-- 1. Create bucket (public = true so images are accessible without auth)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'agency-media',
  'agency-media',
  true,
  2097152, -- 2 MB (enforced by app layer too)
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated agency members to upload into their own folder
--    Path pattern: agencies/{agencyId}/logo.* or agencies/{agencyId}/cover.*
CREATE POLICY "Agency members can upload branding"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'agency-media'
    AND (storage.foldername(name))[1] = 'agencies'
    AND is_agency_member((storage.foldername(name))[2]::uuid, auth.uid())
  );

-- 3. Allow agency members to update (upsert) their own files
CREATE POLICY "Agency members can update branding"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'agency-media'
    AND (storage.foldername(name))[1] = 'agencies'
    AND is_agency_member((storage.foldername(name))[2]::uuid, auth.uid())
  );

-- 4. Allow agency members to delete their own files
CREATE POLICY "Agency members can delete branding"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'agency-media'
    AND (storage.foldername(name))[1] = 'agencies'
    AND is_agency_member((storage.foldername(name))[2]::uuid, auth.uid())
  );

-- 5. Public read access (bucket is public, but explicit policy for clarity)
CREATE POLICY "Public can read agency branding"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'agency-media');
