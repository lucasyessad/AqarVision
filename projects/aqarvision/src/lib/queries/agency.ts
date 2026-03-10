import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Agency, Property } from '@/types/database';
import { PAGINATION } from '@/config';

/**
 * Récupère une agence par son slug.
 * Utilise React cache() pour dédupliquer les requêtes
 * entre le layout et les pages dans la même request.
 */
export const getAgencyBySlug = cache(async (slug: string): Promise<Agency | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('agencies')
    .select('*')
    .eq('slug', slug)
    .single();
  return data as Agency | null;
});

/**
 * Récupère les propriétés actives d'une agence avec pagination.
 * Filtre par status = 'active' pour les pages publiques.
 */
export const getAgencyProperties = cache(
  async (agencyId: string, limit = PAGINATION.PROPERTIES_DEFAULT_LIMIT, offset = 0): Promise<Property[]> => {
    const supabase = await createClient();
    const query = supabase
      .from('properties')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data } = await query;
    return (data || []) as Property[];
  }
);

/**
 * Compte le nombre total de propriétés actives d'une agence.
 */
export const getAgencyPropertiesCount = cache(
  async (agencyId: string): Promise<number> => {
    const supabase = await createClient();
    const { count } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyId)
      .eq('status', 'active');
    return count || 0;
  }
);
