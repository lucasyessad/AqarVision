import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { buildSearchQuery, buildSortOrder } from '@/lib/search/filters';
import { SEARCH } from '@/config';
import type { SearchFilters } from '@/lib/validators/search';
import type { SearchPropertyResult } from '@/types/database';

export const searchProperties = cache(
  async (filters: SearchFilters, limit: number, offset: number): Promise<SearchPropertyResult[]> => {
    const supabase = await createClient();
    const sort = buildSortOrder(filters.sort);

    const baseQuery = supabase
      .from('search_properties_view')
      .select('*');

    const query = buildSearchQuery(baseQuery, filters);

    const { data } = await query
      .order(sort.column, { ascending: sort.ascending })
      .range(offset, offset + limit - 1);

    return (data || []) as SearchPropertyResult[];
  }
);

export const searchPropertiesCount = cache(
  async (filters: SearchFilters): Promise<number> => {
    const supabase = await createClient();

    const baseQuery = supabase
      .from('search_properties_view')
      .select('*', { count: 'exact', head: true });

    const query = buildSearchQuery(baseQuery, filters);

    const { count } = await query;
    return count || 0;
  }
);

export const getSearchPropertyById = cache(
  async (id: string): Promise<SearchPropertyResult | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from('search_properties_view')
      .select('*')
      .eq('property_id', id)
      .single();
    return data as SearchPropertyResult | null;
  }
);

export const getSimilarProperties = cache(
  async (property: SearchPropertyResult): Promise<SearchPropertyResult[]> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from('search_properties_view')
      .select('*')
      .eq('transaction_type', property.transaction_type)
      .neq('property_id', property.property_id)
      .order('published_at', { ascending: false })
      .limit(SEARCH.SIMILAR_PROPERTIES_LIMIT);
    return (data || []) as SearchPropertyResult[];
  }
);
