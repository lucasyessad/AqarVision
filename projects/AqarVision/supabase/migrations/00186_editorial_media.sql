-- M186 — Editorial media bucket + homepage photo settings

-- ── Bucket public editorial ──────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'editorial',
  'editorial',
  true,
  10485760, -- 10 MB
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do nothing;

-- Super admins peuvent uploader
create policy "Super admins can upload editorial media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'editorial'
    and public.is_super_admin(auth.uid())
  );

-- Super admins peuvent supprimer/remplacer
create policy "Super admins can update editorial media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'editorial'
    and public.is_super_admin(auth.uid())
  );

create policy "Super admins can delete editorial media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'editorial'
    and public.is_super_admin(auth.uid())
  );

-- Lecture publique (bucket public, mais policy explicite pour clarity)
create policy "Anyone can read editorial media"
  on storage.objects for select
  using (bucket_id = 'editorial');

-- ── Platform settings — catégorie editorial ──────────────────────────
insert into public.platform_settings (key, value, description, category)
values
  ('editorial_hero_url',      'null'::jsonb, 'URL photo hero homepage (full-bleed, 1600×900)',    'editorial'),
  ('editorial_split_url',     'null'::jsonb, 'URL photo split éditorial (droite, 900×700)',       'editorial'),
  ('editorial_fullbleed_url', 'null'::jsonb, 'URL photo full-bleed "Chaque quartier" (1400×700)', 'editorial')
on conflict (key) do nothing;

-- ── RLS : lecture anonyme pour la catégorie editorial uniquement ──────
create policy "Anyone can read editorial platform settings"
  on public.platform_settings for select
  to anon
  using (category = 'editorial');
