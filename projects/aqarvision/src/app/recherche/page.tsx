import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchProperties, searchPropertiesCount } from '@/lib/queries/search';
import { searchFiltersSchema } from '@/lib/validators/search';
import { SEARCH } from '@/config';
import { SearchBar } from '@/components/search/search-bar';
import { FilterPanel } from '@/components/search/filter-panel';
import { ResultEmptyState } from '@/components/search/result-empty-state';
import { AlertButton } from '@/components/search/alert-button';
import { ResultsWithMap } from '@/components/search/results-with-map';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Recherche immobilière — AqarSearch',
  description: 'Recherchez des biens immobiliers parmi toutes les agences. Filtrez par prix, localisation, surface et plus.',
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RecherchePage({ searchParams }: PageProps) {
  const rawParams = await searchParams;

  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawParams)) {
    if (typeof value === 'string') params[key] = value;
    else if (Array.isArray(value) && value[0]) params[key] = value[0];
  }

  const filters = searchFiltersSchema.parse(params);
  const page    = filters.page;
  const limit   = SEARCH.RESULTS_PER_PAGE;
  const offset  = (page - 1) * limit;

  const [properties, total] = await Promise.all([
    searchProperties(filters, limit, offset),
    searchPropertiesCount(filters),
  ]);

  const totalPages = Math.ceil(total / limit);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const hasFilters = !!(
    filters.q || filters.transaction_type || filters.country ||
    filters.wilaya || filters.commune || filters.city ||
    filters.property_type || filters.price_min || filters.price_max ||
    filters.surface_min || filters.surface_max || filters.rooms_min
  );

  const searchQuery = filters.q ?? '';

  const paginationNode =
    totalPages > 1 ? (
      <nav className="mt-10 flex items-center justify-center gap-4">
        {page > 1 ? (
          <Link
            href={`/recherche?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
            className="flex items-center gap-1.5 h-10 px-4 rounded-md border border-neutral-300 bg-white text-body-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Link>
        ) : (
          <span className="flex items-center gap-1.5 h-10 px-4 rounded-md border border-neutral-200 bg-neutral-50 text-body-sm text-neutral-400">
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </span>
        )}

        <span className="text-body-sm text-neutral-500">
          Page {page} / {totalPages}
        </span>

        {page < totalPages ? (
          <Link
            href={`/recherche?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
            className="flex items-center gap-1.5 h-10 px-4 rounded-md border border-neutral-300 bg-white text-body-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="flex items-center gap-1.5 h-10 px-4 rounded-md border border-neutral-200 bg-neutral-50 text-body-sm text-neutral-400">
            Suivant
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </nav>
    ) : null;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
        <div className="max-w-[1440px] mx-auto px-6 h-[72px] flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg text-primary-900">Aqar</span>
          </Link>

          {/* Nav search bar */}
          <div className="flex-1 max-w-[560px]">
            <Suspense fallback={<div className="h-12 rounded-full bg-neutral-100 animate-pulse" />}>
              <SearchBar variant="nav" defaultValues={{ location: searchQuery }} />
            </Suspense>
          </div>

          {/* Alert button */}
          <div className="ml-auto">
            <Suspense fallback={null}>
              <AlertButton isAuthenticated={isAuthenticated} />
            </Suspense>
          </div>
        </div>

        {/* Filter bar */}
        <div className="border-t border-neutral-100 px-6 py-2 overflow-x-auto">
          <Suspense fallback={null}>
            <FilterPanel />
          </Suspense>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-[1440px] mx-auto px-6 py-6">
        {properties.length > 0 ? (
          <ResultsWithMap
            properties={properties}
            total={total}
            searchQuery={searchQuery}
            isAuthenticated={isAuthenticated}
            pagination={paginationNode}
          />
        ) : (
          <>
            <p className="text-body-sm text-neutral-500 mb-6">
              {total.toLocaleString('fr-FR')} bien{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}
              {searchQuery && <span className="text-neutral-900 font-medium"> à « {searchQuery} »</span>}
            </p>
            <ResultEmptyState hasFilters={hasFilters} />
          </>
        )}
      </div>
    </div>
  );
}
