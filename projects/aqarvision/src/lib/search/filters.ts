import type { SearchFilters } from '@/lib/validators/search';

export function buildSearchQuery(query: any, filters: SearchFilters) { // eslint-disable-line
  let q = query;

  if (filters.q) {
    q = q.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
  }
  if (filters.transaction_type) {
    q = q.eq('transaction_type', filters.transaction_type);
  }
  if (filters.country) {
    q = q.eq('country', filters.country);
  }
  if (filters.wilaya) {
    q = q.ilike('wilaya', `%${filters.wilaya}%`);
  }
  if (filters.commune) {
    q = q.ilike('commune', `%${filters.commune}%`);
  }
  if (filters.city) {
    q = q.ilike('city', `%${filters.city}%`);
  }
  if (filters.property_type) {
    q = q.eq('type', filters.property_type);
  }
  if (filters.price_min) {
    q = q.gte('price', filters.price_min);
  }
  if (filters.price_max) {
    q = q.lte('price', filters.price_max);
  }
  if (filters.surface_min) {
    q = q.gte('surface', filters.surface_min);
  }
  if (filters.surface_max) {
    q = q.lte('surface', filters.surface_max);
  }
  if (filters.rooms_min) {
    q = q.gte('rooms', filters.rooms_min);
  }

  return q;
}

export function buildSortOrder(sort: string): { column: string; ascending: boolean } {
  switch (sort) {
    case 'price_asc':
      return { column: 'price', ascending: true };
    case 'price_desc':
      return { column: 'price', ascending: false };
    case 'surface_asc':
      return { column: 'surface', ascending: true };
    case 'surface_desc':
      return { column: 'surface', ascending: false };
    case 'trust_desc':
      return { column: 'trust_score', ascending: false };
    case 'recent':
    default:
      return { column: 'published_at', ascending: false };
  }
}
