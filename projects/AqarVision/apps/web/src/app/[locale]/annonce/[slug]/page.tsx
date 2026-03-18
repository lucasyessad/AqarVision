import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MapPin, Bed, Bath, Maximize, Calendar, Share2, Building2, Home } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getListingBySlug } from "@/features/listings/services/listing.service";
import { getSimilarListings } from "@/features/marketplace/services/search.service";
import { getPriceHistory } from "@/features/analytics/services/analytics.service";
import { generateListingJsonLd } from "@/lib/seo/json-ld";
import { formatPrice, formatArea } from "@/lib/format";
import { PhotoGallery } from "@/components/ui/PhotoGallery";
import { SimilarListingsCarousel } from "@/components/marketplace/SimilarListingsCarousel";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import { AnnonceContactSection } from "./annonce-contact-section";
import type { LightboxImage } from "@/components/ui/Lightbox";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const supabase = await createClient();
  const listing = await getListingBySlug(supabase, slug, locale);

  if (!listing) {
    return { title: "Annonce introuvable" };
  }

  const tr =
    listing.translations.find((t) => t.locale === locale) ??
    listing.translations.find((t) => t.locale === "fr");

  return {
    title: tr?.title ?? slug.replace(/-/g, " "),
    description: tr?.description?.slice(0, 160),
  };
}

export default async function AnnonceDetailPage({ params }: Props) {
  const { slug, locale } = await params;
  const t = await getTranslations("listing");
  const tCommon = await getTranslations("common.buttons");
  const supabase = await createClient();

  const listing = await getListingBySlug(supabase, slug, locale);

  if (!listing) {
    notFound();
  }

  const tr =
    listing.translations.find((t) => t.locale === locale) ??
    listing.translations.find((t) => t.locale === "fr");

  // Prepare gallery images
  const sortedMedia = [...listing.media].sort((a, b) => {
    if (a.is_cover) return -1;
    if (b.is_cover) return 1;
    return a.position - b.position;
  });

  const images: LightboxImage[] = sortedMedia.map((m) => ({
    src: m.storage_path,
    alt: tr?.title ?? "",
    width: m.width,
    height: m.height,
  }));

  // Fetch similar listings
  let similarListings: import("@/features/listings/types/listing.types").ListingCard[] = [];
  try {
    similarListings = await getSimilarListings(
      supabase,
      listing.id,
      listing.wilaya_code,
      listing.property_type,
      listing.price,
      locale
    );
  } catch {
    // empty
  }

  // Fetch price history
  let priceHistory: import("@/features/analytics/types/analytics.types").PriceHistoryPoint[] = [];
  try {
    priceHistory = await getPriceHistory(supabase, listing.id);
  } catch {
    // empty
  }

  // Fetch agency info if listing belongs to an agency
  let agency: {
    name: string;
    slug: string;
    phone: string;
    whatsapp_phone: string | null;
    verification_level: number;
    contact_button_order: string[] | null;
  } | null = null;

  if (listing.agency_id) {
    const { data } = await supabase
      .from("agencies")
      .select(
        `
        name, slug, phone, whatsapp_phone, contact_button_order,
        verifications(level)
      `
      )
      .eq("id", listing.agency_id)
      .single();

    if (data) {
      const verifications = data.verifications as Array<{ level: number }> | null;
      agency = {
        name: data.name as string,
        slug: data.slug as string,
        phone: data.phone as string,
        whatsapp_phone: data.whatsapp_phone as string | null,
        verification_level: verifications?.[0]?.level ?? 1,
        contact_button_order: data.contact_button_order as string[] | null,
      };
    }
  }

  // JSON-LD structured data
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aqarvision.com";
  const jsonLd = generateListingJsonLd({
    title: tr?.title ?? "",
    description: tr?.description ?? "",
    price: listing.price,
    currency: listing.currency,
    address: listing.address ?? "",
    wilaya: listing.wilaya_code,
    images: sortedMedia.map((m) => m.storage_path),
    area: listing.details.area_m2,
    rooms: listing.details.rooms,
    listingType: listing.listing_type,
    url: `${baseUrl}/${locale}/annonce/${slug}`,
  });

  const details = listing.details;

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Photo gallery */}
      {images.length > 0 ? (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <PhotoGallery images={images} />
        </div>
      ) : (
        <div className="bg-stone-200 dark:bg-stone-800 aspect-video max-h-[500px] w-full flex items-center justify-center">
          <Home className="h-12 w-12 text-stone-400 dark:text-stone-500" />
        </div>
      )}

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8">
          {/* Main content */}
          <div className="space-y-6">
            {/* Title & price */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-full bg-teal-50 dark:bg-teal-950 px-3 py-1 text-xs font-medium text-teal-700 dark:text-teal-300">
                  {t(`type.${listing.listing_type}`)}
                </span>
                <span className="inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-xs font-medium text-stone-600 dark:text-stone-400">
                  {t(`propertyType.${listing.property_type}`)}
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-stone-900 dark:text-stone-100">
                {tr?.title}
              </h1>

              <div className="mt-2 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                <MapPin className="h-4 w-4" />
                <span>{listing.address ?? listing.wilaya_code}</span>
              </div>

              <p className="mt-3 text-3xl font-bold text-stone-900 dark:text-stone-100">
                {formatPrice(listing.price, listing.currency, locale as "fr" | "ar" | "en" | "es")}
              </p>
            </div>

            {/* Key details */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-stone-600 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4" />
                {formatArea(details.area_m2, locale as "fr" | "ar" | "en" | "es")}
              </span>
              {details.rooms != null && (
                <span className="flex items-center gap-1.5">
                  <Bed className="h-4 w-4" />
                  {details.rooms} {t("fields.rooms")}
                </span>
              )}
              {details.bathrooms != null && (
                <span className="flex items-center gap-1.5">
                  <Bath className="h-4 w-4" />
                  {details.bathrooms}
                </span>
              )}
              {details.year_built != null && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {details.year_built}
                </span>
              )}
              {details.floor != null && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  {t("fields.floor")} {details.floor}
                  {details.total_floors ? `/${details.total_floors}` : ""}
                </span>
              )}
            </div>

            {/* Features */}
            {(details.has_parking ||
              details.has_elevator ||
              details.has_balcony ||
              details.has_pool ||
              details.has_garden ||
              details.furnished ||
              details.has_sea_view) && (
              <div className="flex flex-wrap gap-2">
                {details.has_parking && (
                  <span className="inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-xs text-stone-600 dark:text-stone-400">
                    {t("features.parking")}
                  </span>
                )}
                {details.has_elevator && (
                  <span className="inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-xs text-stone-600 dark:text-stone-400">
                    {t("features.elevator")}
                  </span>
                )}
                {details.has_balcony && (
                  <span className="inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-xs text-stone-600 dark:text-stone-400">
                    {t("features.balcony")}
                  </span>
                )}
                {details.has_pool && (
                  <span className="inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-xs text-stone-600 dark:text-stone-400">
                    {t("features.pool")}
                  </span>
                )}
                {details.has_garden && (
                  <span className="inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-xs text-stone-600 dark:text-stone-400">
                    {t("features.garden")}
                  </span>
                )}
                {details.furnished && (
                  <span className="inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-xs text-stone-600 dark:text-stone-400">
                    {t("features.furnished")}
                  </span>
                )}
                {details.has_sea_view && (
                  <span className="inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-xs text-stone-600 dark:text-stone-400">
                    {t("features.seaView")}
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-3">
                {t("fields.description")}
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap">
                {tr?.description}
              </p>
            </div>

            {/* Price history */}
            {priceHistory.length > 1 && (
              <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-3">
                  {t("priceHistory")}
                </h2>
                <div className="space-y-2">
                  {priceHistory.map((point, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-stone-500 dark:text-stone-400">
                        {new Date(point.date).toLocaleDateString(locale)}
                      </span>
                      <span className="font-medium text-stone-900 dark:text-stone-100">
                        {formatPrice(point.price, listing.currency, locale as "fr" | "ar" | "en" | "es")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share button */}
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-stone-300 dark:border-stone-600 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-fast"
            >
              <Share2 className="h-4 w-4" />
              {tCommon("share")}
            </button>

            {/* Similar listings */}
            {similarListings.length > 0 && (
              <SimilarListingsCarousel listings={similarListings} />
            )}
          </div>

          {/* ContactCard sidebar */}
          <div className="lg:sticky lg:top-24">
            {agency ? (
              <AnnonceContactSection
                agencyName={agency.name}
                agencySlug={agency.slug}
                verificationLevel={agency.verification_level as 1 | 2 | 3 | 4}
                phone={listing.contact_phone ?? agency.phone}
                whatsappPhone={agency.whatsapp_phone ?? undefined}
                listingTitle={tr?.title ?? ""}
                listingId={listing.id}
                buttonOrder={agency.contact_button_order ?? undefined}
              />
            ) : (
              <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5">
                {listing.contact_phone && listing.show_phone && (
                  <a
                    href={`tel:${listing.contact_phone}`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 dark:bg-amber-500 px-4 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-500 dark:hover:bg-amber-400 transition-colors duration-fast"
                  >
                    {t("contact.call")}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
