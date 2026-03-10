import { Suspense } from 'react';
import type { Metadata } from 'next';
import { searchProperties, searchPropertiesCount } from '@/lib/queries/search';
import { searchFiltersSchema } from '@/lib/validators/search';
import { SEARCH } from '@/config';
import { SearchBar } from '@/components/search/search-bar';
import { FilterPanel } from '@/components/search/filter-panel';
import { ResultCard } from '@/components/search/result-card';
import { ResultEmptyState } from '@/components/search/result-empty-state';
import { FavoriteButton } from '@/components/search/favorite-button';
import { AlertButton } from '@/components/search/alert-button';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Recherche immobilière — AqarSearch',
  description: 'Recherchez des biens immobiliers parmi toutes les agences. Filtrez par prix, localisation, surface et plus.',
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RecherchePage({ searchParams }: PageProps) {
  const rawParams = await searchParams;

  // Normalize searchParams
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawParams)) {
    if (typeof value === 'string') params[key] = value;
    else if (Array.isArray(value) && value[0]) params[key] = value[0];
  }

  const filters = searchFiltersSchema.parse(params);
  const page = filters.page;
  const limit = SEARCH.RESULTS_PER_PAGE;
  const offset = (page - 1) * limit;

  const [properties, total] = await Promise.all([
    searchProperties(filters, limit, offset),
    searchPropertiesCount(filters),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Check auth for favorite button
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  // Check if any filter is active
  const hasFilters = !!(
    filters.q || filters.transaction_type || filters.country ||
    filters.wilaya || filters.commune || filters.city ||
    filters.property_type || filters.price_min || filters.price_max ||
    filters.surface_min || filters.surface_max || filters.rooms_min
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Aqar<span className="text-blue-600">Search</span>
          </h1>
          <Suspense fallback={<div className="h-12 animate-pulse rounded-lg bg-gray-100" />}>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Filters + Alert */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex-1">
            <Suspense fallback={null}>
              <FilterPanel />
            </Suspense>
          </div>
          <Suspense fallback={null}>
            <AlertButton isAuthenticated={isAuthenticated} />
          </Suspense>
        </div>

        {/* Results count */}
        <p className="mb-4 text-sm text-gray-500">
          {total} bien{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}
        </p>

        {/* Results grid */}
        {properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <ResultCard
                  key={property.property_id}
                  property={property}
                  favoriteButton={
                    <FavoriteButton
                      propertyId={property.property_id}
                      isFavorited={false}
                      isAuthenticated={isAuthenticated}
                    />
                  }
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-4">
                {page > 1 ? (
                  <Link
                    href={`/recherche?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-400">
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </span>
                )}

                <span className="text-sm text-gray-600">
                  Page {page} / {totalPages}
                </span>

                {page < totalPages ? (
                  <Link
                    href={`/recherche?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-400">
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </nav>
            )}
          </>
        ) : (
          <ResultEmptyState hasFilters={hasFilters} />
        )}
      </div>
    </div>
  );
}
