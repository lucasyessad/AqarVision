import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { SearchPropertyResult } from '@/types/database';

export const getUserFavorites = cache(
  async (userId: string): Promise<SearchPropertyResult[]> => {
    const supabase = await createClient();
    const { data: favs } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!favs || favs.length === 0) return [];

    const propertyIds = favs.map((f: { property_id: string }) => f.property_id);
    const { data } = await supabase
      .from('search_properties_view')
      .select('*')
      .in('property_id', propertyIds);

    return (data || []) as SearchPropertyResult[];
  }
);

export const getUserFavoritesCount = cache(
  async (userId: string): Promise<number> => {
    const supabase = await createClient();
    const { count } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    return count || 0;
  }
);

export const isPropertyFavorited = cache(
  async (userId: string, propertyId: string): Promise<boolean> => {
    const supabase = await createClient();
    const { count } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('property_id', propertyId);
    return (count || 0) > 0;
  }
);
