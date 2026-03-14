-- Numéro de référence séquentiel pour chaque annonce
-- Format: AV-XXXXX (affiché en application)

-- Créer la séquence
create sequence if not exists public.listing_reference_seq
  start 1
  increment 1
  minvalue 1
  maxvalue 9999999
  cache 1;

-- Ajouter la colonne à la table listings
alter table public.listings
  add column if not exists reference_number integer
    not null
    default nextval('public.listing_reference_seq')
    unique;

-- Créer un index pour la recherche par numéro de référence
create unique index if not exists listings_reference_number_idx
  on public.listings (reference_number);

-- Backfill les annonces existantes (si des annonces existent déjà sans référence)
-- La valeur DEFAULT nextval s'applique automatiquement aux nouvelles lignes
-- Pour les existantes sans valeur, elles ont déjà eu le DEFAULT à l'INSERT

-- Fonction helper pour formater le numéro de référence
create or replace function public.format_listing_reference(ref_num integer)
returns text
language sql
immutable
as $$
  select 'AV-' || lpad(ref_num::text, 5, '0');
$$;
