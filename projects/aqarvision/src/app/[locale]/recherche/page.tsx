import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { searchProperties, searchPropertiesCount } from "@/lib/queries/search";
import { searchFiltersSchema } from "@/lib/validators/search";
import { SearchBar } from "@/components/search/search-bar";
import { FilterPanel } from "@/components/search/filter-panel";
import { ResultsWithMap } from "@/components/search/results-with-map";
import { ResultEmptyState } from "@/components/search/result-empty-state";
import { createClient } from "@/lib/supabase/server";
import { getDirection, LOCALES, type Locale } from "@/lib/i18n";
import { SEARCH } from "@/config";

const LOCALES_VALIDES: readonly string[] = LOCALES;

interface RecherchePageProps {
  params: { locale: string };
  searchParams: Record<string, string | string[] | undefined>;
}

const meta = {
  fr: {
    titre: "Explorer les biens immobiliers en Algérie | AqarVision",
    description:
      "Recherchez parmi des milliers d'annonces immobilières en Algérie. Vente et location d'appartements, villas, terrains et locaux commerciaux.",
  },
  ar: {
    titre: "استكشف العقارات في الجزائر | عقار فيجن",
    description:
      "ابحث بين آلاف الإعلانات العقارية في الجزائر. بيع وإيجار شقق، فيلات، أراضي ومحلات تجارية.",
  },
  en: {
    titre: "Explore Real Estate in Algeria | AqarVision",
    description:
      "Search thousands of property listings across Algeria. Sale and rental of apartments, villas, land and commercial properties.",
  },
};

export async function generateMetadata({
  params,
}: RecherchePageProps): Promise<Metadata> {
  const locale = LOCALES_VALIDES.includes(params.locale) ? params.locale : "fr";
  const m = meta[locale as keyof typeof meta] || meta.fr;

  const alternates: Record<string, string> = {};
  LOCALES_VALIDES.forEach((l) => {
    alternates[l] = `/${l}/recherche`;
  });

  return {
    title: m.titre,
    description: m.description,
    alternates: { languages: alternates },
    openGraph: {
      title: m.titre,
      description: m.description,
      type: "website",
      locale: locale === "ar" ? "ar_DZ" : locale === "en" ? "en_US" : "fr_DZ",
      siteName: "AqarVision",
    },
  };
}

export default async function RecherchePage({
  params,
  searchParams,
}: RecherchePageProps) {
  const locale = (
    LOCALES_VALIDES.includes(params.locale) ? params.locale : "fr"
  ) as Locale;
  const dir = getDirection(locale);

  // Parse search params with Zod
  const rawParams: Record<string, string> = {};
  for (const [key, val] of Object.entries(searchParams)) {
    if (typeof val === "string") {
      rawParams[key] = val;
    } else if (Array.isArray(val) && val.length > 0) {
      rawParams[key] = val[0];
    }
  }

  const filters = searchFiltersSchema.parse(rawParams);
  const page = filters.page;
  const limit = SEARCH.RESULTS_PER_PAGE;
  const offset = (page - 1) * limit;

  const [properties, total] = await Promise.all([
    searchProperties(filters, limit, offset),
    searchPropertiesCount(filters),
  ]);

  const totalPages = Math.ceil(total / limit);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const searchQuery = filters.q ?? '';

  const hasFilters = !!(
    filters.q || filters.transaction_type || filters.country ||
    filters.wilaya || filters.commune || filters.city ||
    filters.property_type || filters.price_min || filters.price_max ||
    filters.surface_min || filters.surface_max || filters.rooms_min
  );

  const paginationNode =
    totalPages > 1 ? (
      <nav className="mt-10 flex items-center justify-center gap-4">
        {page > 1 ? (
          <Link
            href={`/${locale}/recherche?${new URLSearchParams({ ...rawParams, page: String(page - 1) }).toString()}`}
            className="flex items-center gap-1.5 h-10 px-4 rounded-md border border-neutral-300 bg-white text-body-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {locale === "ar" ? "السابق" : locale === "en" ? "Previous" : "Précédent"}
          </Link>
        ) : (
          <span className="flex items-center gap-1.5 h-10 px-4 rounded-md border border-neutral-200 bg-neutral-50 text-body-sm text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
            {locale === "ar" ? "السابق" : locale === "en" ? "Previous" : "Précédent"}
          </span>
        )}

        <span className="text-body-sm text-muted-foreground">
          {locale === "ar" ? `${page} / ${totalPages}` : `Page ${page} / ${totalPages}`}
        </span>

        {page < totalPages ? (
          <Link
            href={`/${locale}/recherche?${new URLSearchParams({ ...rawParams, page: String(page + 1) }).toString()}`}
            className="flex items-center gap-1.5 h-10 px-4 rounded-md border border-neutral-300 bg-white text-body-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            {locale === "ar" ? "التالي" : locale === "en" ? "Next" : "Suivant"}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="flex items-center gap-1.5 h-10 px-4 rounded-md border border-neutral-200 bg-neutral-50 text-body-sm text-muted-foreground">
            {locale === "ar" ? "التالي" : locale === "en" ? "Next" : "Suivant"}
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </nav>
    ) : null;

  return (
    <div className="min-h-screen bg-blanc-casse" dir={dir}>
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-bleu-nuit rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              Aqar<span className="text-or">Vision</span>
            </span>
          </Link>

          <div className="flex-1 max-w-[560px]">
            <Suspense fallback={null}>
              <SearchBar variant="nav" defaultValues={{ location: searchQuery }} />
            </Suspense>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {locale === "ar" ? "الأسعار" : locale === "en" ? "Pricing" : "Tarifs"}
            </Link>
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {locale === "ar" ? "دخول" : locale === "en" ? "Log in" : "Connexion"}
            </Link>
          </nav>
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
            <p className="text-body-sm text-muted-foreground mb-6">
              {total.toLocaleString('fr-FR')} bien{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}
            </p>
            <ResultEmptyState hasFilters={hasFilters} />
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-white py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-bleu-nuit rounded flex items-center justify-center">
              <Building2 className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs text-muted-foreground">
              {locale === "ar"
                ? "مدعوم من عقار فيجن"
                : locale === "en"
                ? "Powered by AqarVision"
                : "Propulsé par AqarVision"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AqarVision
          </p>
        </div>
      </footer>
    </div>
  );
}
