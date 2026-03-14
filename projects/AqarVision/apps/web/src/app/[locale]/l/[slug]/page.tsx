import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getListingBySlug } from "@/features/marketplace/services/search.service";
import { generateListingJsonLd } from "@/lib/seo/json-ld";
import { Link } from "@/lib/i18n/navigation";

interface ListingPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ListingPageProps) {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const listing = await getListingBySlug(supabase, locale, slug);

  if (!listing) {
    return { title: "Not found" };
  }

  const alternateLanguages: Record<string, string> = {};
  for (const t of listing.translations) {
    alternateLanguages[t.locale] = `/${t.locale}/l/${t.slug}`;
  }

  return {
    title: listing.title,
    description: listing.description?.slice(0, 160) ?? "",
    alternates: {
      languages: alternateLanguages,
    },
    openGraph: {
      title: listing.title,
      description: listing.description?.slice(0, 160) ?? "",
      type: "website",
      images: listing.media
        .filter((m) => m.is_cover)
        .map((m) => ({ url: m.storage_path })),
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

  const supabase = await createClient();
  const listing = await getListingBySlug(supabase, locale, slug);

  if (!listing) {
    notFound();
  }

  const jsonLd = generateListingJsonLd({
    title: listing.title,
    description: listing.description,
    price: listing.current_price,
    currency: listing.currency,
    images: listing.media.map((m) => m.storage_path),
    url: `/${locale}/l/${slug}`,
    agencyName: listing.agency_name,
    propertyType: listing.property_type,
    rooms: listing.rooms,
    surface: listing.surface_m2,
  });

  const coverImage = listing.media.find((m) => m.is_cover) ?? listing.media[0];

  return (
    <main className="min-h-screen bg-[#f7fafc]">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Image gallery */}
      <div className="bg-gray-100">
        <div className="mx-auto max-w-7xl">
          {listing.media.length > 0 ? (
            <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
              {/* Main image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={coverImage?.storage_path ?? ""}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Secondary images */}
              <div className="grid grid-cols-2 gap-1">
                {listing.media.slice(1, 5).map((media) => (
                  <div key={media.id} className="aspect-[4/3] overflow-hidden">
                    <img
                      src={media.storage_path}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex aspect-[21/9] items-center justify-center">
              <svg
                className="h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main content */}
          <div className="flex-1">
            {/* Title & badges */}
            <div className="mb-4">
              <div className="mb-2 flex flex-wrap gap-2">
                <span className="rounded bg-[#d4af37]/15 px-2 py-0.5 text-xs font-medium text-[#d4af37]">
                  {tListings(listing.listing_type)}
                </span>
                <span className="rounded bg-[#1a365d]/10 px-2 py-0.5 text-xs font-medium text-[#1a365d]">
                  {tListings(listing.property_type)}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-[#2d3748] md:text-3xl">
                {listing.title}
              </h1>
            </div>

            {/* Price */}
            <p className="mb-6 text-3xl font-bold text-[#1a365d]">
              {formatPrice(listing.current_price, listing.currency)}
            </p>

            {/* Property details grid */}
            <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-4">
              {listing.surface_m2 !== null && (
                <div>
                  <p className="text-xs text-[#a0aec0]">{tListings("surface")}</p>
                  <p className="text-sm font-semibold text-[#2d3748]">
                    {listing.surface_m2} m&sup2;
                  </p>
                </div>
              )}
              {listing.rooms !== null && (
                <div>
                  <p className="text-xs text-[#a0aec0]">{tListings("rooms")}</p>
                  <p className="text-sm font-semibold text-[#2d3748]">
                    {listing.rooms}
                  </p>
                </div>
              )}
              {listing.bathrooms !== null && (
                <div>
                  <p className="text-xs text-[#a0aec0]">{tListings("bathrooms")}</p>
                  <p className="text-sm font-semibold text-[#2d3748]">
                    {listing.bathrooms}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-[#a0aec0]">{tListings("wilaya")}</p>
                <p className="text-sm font-semibold text-[#2d3748]">
                  {listing.wilaya_code}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="mb-2 text-lg font-semibold text-[#2d3748]">
                {tListings("description_field")}
              </h2>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-[#2d3748]">
                {listing.description}
              </div>
            </div>

            {/* Details JSON */}
            {Object.keys(listing.details).length > 0 && (
              <div className="mb-6">
                <h2 className="mb-2 text-lg font-semibold text-[#2d3748]">
                  {tListings("details")}
                </h2>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-3">
                  {Object.entries(listing.details).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs capitalize text-[#a0aec0]">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm font-medium text-[#2d3748]">
                        {typeof value === "boolean"
                          ? value
                            ? "Oui"
                            : "Non"
                          : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Agency card */}
          <div className="w-full shrink-0 lg:w-80">
            <div className="sticky top-4 rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                {listing.agency_logo_url ? (
                  <img
                    src={listing.agency_logo_url}
                    alt={listing.agency_name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1a365d] text-lg font-bold text-white">
                    {listing.agency_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-[#2d3748]">
                    {listing.agency_name}
                  </h3>
                  <Link
                    href={`/a/${listing.agency_slug}`}
                    className="text-xs text-[#d4af37] hover:underline"
                  >
                    {t("view_details")}
                  </Link>
                </div>
              </div>

              {listing.agency_phone && (
                <a
                  href={`tel:${listing.agency_phone}`}
                  className="mb-3 block w-full rounded-lg bg-[#1a365d] px-4 py-3 text-center font-medium text-white transition-colors hover:bg-[#1a365d]/90"
                >
                  {t("contact_agency")}
                </a>
              )}

              {!listing.agency_phone && (
                <Link
                  href={`/a/${listing.agency_slug}`}
                  className="mb-3 block w-full rounded-lg bg-[#1a365d] px-4 py-3 text-center font-medium text-white transition-colors hover:bg-[#1a365d]/90"
                >
                  {t("contact_agency")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
