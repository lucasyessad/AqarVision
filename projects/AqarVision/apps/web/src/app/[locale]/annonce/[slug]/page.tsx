import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getListingBySlug } from "@/features/marketplace/services/search.service";

export const revalidate = 3600;
import { formatListingRef } from "@/features/marketplace/types/search.types";
import { generateListingJsonLd } from "@/lib/seo/json-ld";
import { Link } from "@/lib/i18n/navigation";
import { getAgencyUrl } from "@/lib/agency-url";
import { recordView } from "@/features/marketplace/actions/view-history.action";
import { getListingNote } from "@/features/marketplace/actions/listing-notes.action";
import { ListingNoteWidget } from "@/features/marketplace/components/ListingNoteWidget";
import { MortgageCalculator } from "@/features/marketplace/components/MortgageCalculator";
import { PhotoGallery } from "@/features/marketplace/components/PhotoGallery";
import { ListingAISummary } from "@/features/listings/components/ListingAISummary";
import { Suspense } from "react";
import { MarketingHeaderWrapper } from "@/components/marketing/MarketingHeaderWrapper";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import {
  ChevronLeft,
  Phone,
  Check,
} from "lucide-react";

const getCachedListing = cache(async (locale: string, slug: string) => {
  const supabase = await createClient();
  return getListingBySlug(supabase, locale, slug);
});

interface ListingPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ListingPageProps) {
  const { locale, slug } = await params;
  const listing = await getCachedListing(locale, slug);

  if (!listing) {
    return { title: "Not found" };
  }

  const alternateLanguages: Record<string, string> = {};
  for (const t of listing.translations) {
    alternateLanguages[t.locale] = `/${t.locale}/annonce/${t.slug}`;
  }

  return {
    title: listing.title,
    description: listing.description?.slice(0, 160) ?? "",
    alternates: { languages: alternateLanguages },
    openGraph: {
      title: listing.title,
      description: listing.description?.slice(0, 160) ?? "",
      type: "website",
      images: listing.media.filter((m) => m.is_cover).map((m) => ({ url: m.storage_path })),
    },
  };
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "search" });
  const tListings = await getTranslations({ locale, namespace: "listings" });

  const listing = await getCachedListing(locale, slug);

  if (!listing) {
    notFound();
  }

  void recordView(listing.id);
  const existingNote = await getListingNote(listing.id);

  const jsonLd = generateListingJsonLd({
    title: listing.title,
    description: listing.description,
    price: listing.current_price,
    currency: listing.currency,
    images: listing.media.map((m) => m.storage_path),
    url: `/${locale}/annonce/${slug}`,
    agencyName: listing.agency_name,
    propertyType: listing.property_type,
    rooms: listing.rooms,
    surface: listing.surface_m2,
  });

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Suspense fallback={<MarketingHeader locale={locale} user={null} />}>
        <MarketingHeaderWrapper locale={locale} />
      </Suspense>

      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">

        {/* -- Breadcrumb -------------------------------------------------- */}
        <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto flex max-w-[1320px] items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Link
              href="/search"
              locale={locale}
              className="flex items-center gap-1 text-zinc-500 transition-colors hover:text-amber-500 dark:text-zinc-400 dark:hover:text-amber-400"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Annonces
            </Link>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <span className="text-zinc-600 dark:text-zinc-300">{listing.wilaya_name}</span>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <span className="max-w-[200px] truncate text-zinc-900 dark:text-zinc-100">
              {listing.title}
            </span>
          </div>
        </div>

        {/* -- Photo hero -- full-bleed 55vh -------------------------------- */}
        <div className="relative h-[55vh] w-full overflow-hidden bg-zinc-950">
          <PhotoGallery media={listing.media} title={listing.title} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* -- Content ----------------------------------------------------- */}
        <div className="mx-auto grid max-w-[1200px] gap-8 px-6 py-8 lg:grid-cols-[1fr_360px]">

          {/* -- Main content ---------------------------------------------- */}
          <div className="min-w-0">

            {/* Type chips */}
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-500 dark:bg-amber-500/20 dark:text-amber-400">
                {tListings(listing.listing_type)}
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-500 dark:bg-amber-900/30 dark:text-amber-400">
                {tListings(listing.property_type)}
              </span>
            </div>

            {/* Agency + Reference */}
            <div className="mb-3 flex items-center gap-3 text-sm">
              <Link
                href={`/a/${listing.agency_slug}`}
                className="flex items-center gap-2 font-medium text-zinc-600 transition-colors hover:text-amber-500 dark:text-zinc-400 dark:hover:text-amber-400"
              >
                {listing.agency_logo_url ? (
                  <img
                    src={listing.agency_logo_url}
                    alt={listing.agency_name}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 text-[9px] font-bold text-amber-500 dark:bg-amber-900/30 dark:text-amber-400">
                    {listing.agency_name.charAt(0).toUpperCase()}
                  </span>
                )}
                {listing.agency_name}
              </Link>
              <span className="text-zinc-300 dark:text-zinc-600">·</span>
              <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                {formatListingRef(listing.reference_number)}
              </span>
            </div>

            {/* Editorial title */}
            <h1 className="mb-5 font-display text-2xl font-bold leading-snug text-zinc-900 md:text-3xl dark:text-zinc-50">
              {listing.title}
            </h1>

            {/* Price block */}
            <div className="mb-6 inline-flex flex-col rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {formatPrice(listing.current_price, listing.currency)}
              </p>
              {listing.surface_m2 !== null && listing.surface_m2 > 0 && listing.current_price > 0 && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <span className="font-semibold text-amber-500 dark:text-amber-400">
                    {formatPrice(Math.round(listing.current_price / listing.surface_m2), listing.currency)}
                  </span>
                  {" "}/ m²
                </p>
              )}
            </div>

            {/* Property details grid */}
            <div className="mb-8 grid grid-cols-2 gap-4 rounded-xl border border-zinc-200 bg-white p-5 sm:grid-cols-4 dark:border-zinc-700 dark:bg-zinc-900">
              {listing.surface_m2 !== null && (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    {tListings("surface")}
                  </p>
                  <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {listing.surface_m2} m²
                  </p>
                </div>
              )}
              {listing.rooms !== null && (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    {tListings("rooms")}
                  </p>
                  <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {listing.rooms}
                  </p>
                </div>
              )}
              {listing.bathrooms !== null && (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    {tListings("bathrooms")}
                  </p>
                  <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {listing.bathrooms}
                  </p>
                </div>
              )}
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  {tListings("wilaya")}
                </p>
                <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {listing.commune_name
                    ? `${listing.commune_name}, ${listing.wilaya_name}`
                    : listing.wilaya_name}
                </p>
              </div>
            </div>

            {/* Panel IA */}
            <ListingAISummary data={null} />

            {/* Description */}
            {listing.description && (
              <div className="mb-8">
                <h2 className="mb-4 font-display text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  Description
                </h2>
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {listing.description}
                  </p>
                </div>
              </div>
            )}

            {/* Details / Equipements */}
            {Object.keys(listing.details).length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 font-display text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {tListings("details")}
                </h2>
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-zinc-200 bg-white p-5 sm:grid-cols-3 dark:border-zinc-700 dark:bg-zinc-900">
                  {Object.entries(listing.details).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30">
                        <Check className="h-2.5 w-2.5 text-amber-500 dark:text-amber-400" />
                      </span>
                      <div>
                        <p className="text-xs capitalize text-zinc-500 dark:text-zinc-400">
                          {key.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {typeof value === "boolean"
                            ? value ? "Oui" : "Non"
                            : String(value)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* -- Sidebar --------------------------------------------------- */}
          <div className="w-full shrink-0">
            <div className="sticky top-20 space-y-4">

              {/* Agency contact card */}
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                {/* Card header */}
                <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-700">
                  <div className="flex items-center gap-3">
                    {listing.agency_logo_url ? (
                      <img
                        src={listing.agency_logo_url}
                        alt={listing.agency_name}
                        className="h-12 w-12 rounded-xl object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-lg font-bold text-amber-500 dark:bg-amber-900/30 dark:text-amber-400">
                        {listing.agency_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-display font-semibold text-zinc-900 dark:text-zinc-50">
                        {listing.agency_name}
                      </h3>
                      <Link
                        href={`/a/${listing.agency_slug}`}
                        className="text-xs text-amber-500 transition-colors hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
                      >
                        Voir la vitrine →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="space-y-3 p-5">
                  {listing.agency_phone ? (
                    <a
                      href={`tel:${listing.agency_phone}`}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-50 transition-opacity hover:opacity-90 dark:bg-zinc-50 dark:text-zinc-950"
                    >
                      <Phone className="h-4 w-4" />
                      {t("contact_agency")}
                    </a>
                  ) : (
                    <Link
                      href={`/a/${listing.agency_slug}`}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-50 transition-opacity hover:opacity-90 dark:bg-zinc-50 dark:text-zinc-950"
                    >
                      {t("contact_agency")}
                    </Link>
                  )}

                  <Link
                    href={`/a/${listing.agency_slug}`}
                    className="flex w-full items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Voir toutes les annonces
                  </Link>
                </div>
              </div>

              {/* Private note */}
              <ListingNoteWidget
                listingId={listing.id}
                initialContent={existingNote?.content ?? ""}
              />

              {/* Mortgage calculator */}
              {listing.current_price > 0 && (
                <MortgageCalculator defaultPrice={listing.current_price} />
              )}
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter locale={locale} />
    </>
  );
}
