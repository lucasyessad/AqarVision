'use server';

import { createClient } from '@/lib/supabase/server';
import type { SearchPropertyResult } from '@/types/database';

export async function getPropertiesForComparison(
  ids: string[]
): Promise<{ data: SearchPropertyResult[] | null; error?: string }> {
  if (!ids || ids.length === 0) {
    return { data: [], error: undefined };
  }

  // Limit to 4 properties
  const safeIds = ids.slice(0, 4);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('search_properties_view')
    .select('*')
    .in('property_id', safeIds);

  if (error) {
    return { data: null, error: `Erreur lors de la récupération des biens: ${error.message}` };
  }

  // Preserve the order from safeIds
  const ordered = safeIds
    .map((id) => (data as SearchPropertyResult[]).find((p) => p.property_id === id))
    .filter((p): p is SearchPropertyResult => !!p);

  return { data: ordered };
}
