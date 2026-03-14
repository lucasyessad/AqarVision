import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getListingBySlug } from "@/features/marketplace/services/search.service";
import { formatListingRef } from "@/features/marketplace/types/search.types";
import { generateListingJsonLd } from "@/lib/seo/json-ld";
import { Link } from "@/lib/i18n/navigation";
import { recordView } from "@/features/marketplace/actions/view-history.action";
import { getListingNote } from "@/features/marketplace/actions/listing-notes.action";
import { ListingNoteWidget } from "@/features/marketplace/components/ListingNoteWidget";
import { MortgageCalculator } from "@/features/marketplace/components/MortgageCalculator";
import { PhotoGallery } from "@/features/marketplace/components/PhotoGallery";

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

  const supabase = await createClient();
  const listing = await getListingBySlug(supabase, locale, slug);

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
    url: `/${locale}/l/${slug}`,
    agencyName: listing.agency_name,
    propertyType: listing.property_type,
    rooms: listing.rooms,
    surface: listing.surface_m2,
  });

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-deep)" }}>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Photo gallery */}
      <div style={{ background: "var(--bg-secondary)" }}>
        <div className="mx-auto max-w-[1320px]">
          <PhotoGallery media={listing.media} title={listing.title} />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1320px] px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">

          {/* ── Main content ────────────────────────────────────── */}
          <div className="flex-1">
            {/* Type badges */}
            <div className="mb-3 flex flex-wrap gap-2">
              <span
                className="rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide"
                style={{ background: "var(--amber-glow)", color: "var(--amber)" }}
              >
                {tListings(listing.listing_type)}
              </span>
              <span
                className="rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide"
                style={{ background: "var(--cyan-ghost)", color: "var(--cyan)" }}
              >
                {tListings(listing.property_type)}
              </span>
            </div>

            {/* Agency + Reference */}
            <div className="mb-3 flex items-center gap-3 text-sm">
              <Link
                href={`/a/${listing.agency_slug}`}
                className="flex items-center gap-1.5 font-medium transition-colors"
                style={{ color: "var(--cyan)" }}
              >
                {listing.agency_logo_url ? (
                  <img
                    src={listing.agency_logo_url}
                    alt={listing.agency_name}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
                    style={{ background: "var(--bg-surface)", color: "var(--cyan)" }}
                  >
                    {listing.agency_name.charAt(0).toUpperCase()}
                  </span>
                )}
                {listing.agency_name}
              </Link>
              <span style={{ color: "var(--border-hover)" }}>·</span>
              <span className="font-mono text-xs" style={{ color: "var(--text-tertiary)" }}>
                {formatListingRef(listing.reference_number)}
              </span>
            </div>

            <h1 className="mb-4 text-2xl font-extrabold tracking-tight md:text-3xl" style={{ color: "var(--text-primary)" }}>
              {listing.title}
            </h1>

            {/* Price */}
            <div className="mb-6">
              <p className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                {formatPrice(listing.current_price, listing.currency)}
              </p>
              {listing.surface_m2 !== null && listing.surface_m2 > 0 && listing.current_price > 0 && (
                <p className="mt-1 font-mono text-sm" style={{ color: "var(--text-tertiary)" }}>
                  {formatPrice(Math.round(listing.current_price / listing.surface_m2), listing.currency)} / m²
                </p>
              )}
            </div>

            {/* Property details grid */}
            <div
              className="mb-6 grid grid-cols-2 gap-4 rounded-xl border p-4 sm:grid-cols-4"
              style={{ background: "var(--bg-card)", borderColor: "var(--border-light)" }}
            >
              {listing.surface_m2 !== null && (
                <div>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{tListings("surface")}</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {listing.surface_m2} m²
                  </p>
                </div>
              )}
              {listing.rooms !== null && (
                <div>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{tListings("rooms")}</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {listing.rooms}
                  </p>
                </div>
              )}
              {listing.bathrooms !== null && (
                <div>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{tListings("bathrooms")}</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {listing.bathrooms}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{tListings("wilaya")}</p>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {listing.commune_name
                    ? `${listing.commune_name}, ${listing.wilaya_name}`
                    : listing.wilaya_name}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                {tListings("description_field")}
              </h2>
              <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {listing.description}
              </div>
            </div>

            {/* Details JSON */}
            {Object.keys(listing.details).length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  {tListings("details")}
                </h2>
                <div
                  className="grid grid-cols-2 gap-3 rounded-xl border p-4 sm:grid-cols-3"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border-light)" }}
                >
                  {Object.entries(listing.details).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs capitalize" style={{ color: "var(--text-tertiary)" }}>
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {typeof value === "boolean"
                          ? value ? "Oui" : "Non"
                          : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ─────────────────────────────────────────── */}
          <div className="w-full shrink-0 lg:w-80">
            <div className="sticky top-4 space-y-4">

              {/* Agency contact card */}
              <div
                className="rounded-xl border p-6"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-light)" }}
              >
                <div className="mb-5 flex items-center gap-3">
                  {listing.agency_logo_url ? (
                    <img
                      src={listing.agency_logo_url}
                      alt={listing.agency_name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
                      style={{ background: "var(--bg-surface)", color: "var(--cyan)" }}
                    >
                      {listing.agency_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {listing.agency_name}
                    </h3>
                    <Link
                      href={`/a/${listing.agency_slug}`}
                      className="text-xs transition-colors"
                      style={{ color: "var(--cyan)" }}
                    >
                      {t("view_details")}
                    </Link>
                  </div>
                </div>

                {listing.agency_phone ? (
                  <a
                    href={`tel:${listing.agency_phone}`}
                    className="mb-3 block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ background: "var(--cyan)", color: "var(--text-inverse)" }}
                  >
                    {t("contact_agency")}
                  </a>
                ) : (
                  <Link
                    href={`/a/${listing.agency_slug}`}
                    className="mb-3 block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ background: "var(--cyan)", color: "var(--text-inverse)" }}
                  >
                    {t("contact_agency")}
                  </Link>
                )}
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
      </div>
    </main>
  );
}
