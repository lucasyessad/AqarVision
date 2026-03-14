-- Bucket : listing-media (private)
insert into storage.buckets (id, name, public) values ('listing-media', 'listing-media', false);

-- Upload: authenticated users can upload
create policy "listing_media_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-media'
    and auth.uid() is not null
  );

-- Select: authenticated users can read (signed URLs for public access)
create policy "listing_media_select"
  on storage.objects for select
  using (
    bucket_id = 'listing-media'
    and auth.uid() is not null
  );

-- Update: authenticated users can update their uploads
create policy "listing_media_update"
  on storage.objects for update
  using (
    bucket_id = 'listing-media'
    and auth.uid() is not null
  );

-- Delete: authenticated users can delete
create policy "listing_media_delete"
  on storage.objects for delete
  using (
    bucket_id = 'listing-media'
    and auth.uid() is not null
  );

-- Bucket : listing-documents (private, no public access)
insert into storage.buckets (id, name, public) values ('listing-documents', 'listing-documents', false);

create policy "listing_documents_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-documents'
    and auth.uid() is not null
  );

create policy "listing_documents_select"
  on storage.objects for select
  using (
    bucket_id = 'listing-documents'
    and auth.uid() is not null
  );

create policy "listing_documents_delete"
  on storage.objects for delete
  using (
    bucket_id = 'listing-documents'
    and auth.uid() is not null
  );
