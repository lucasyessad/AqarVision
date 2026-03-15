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
import { Suspense } from "react";
import { MarketingHeaderWrapper } from "@/components/marketing/MarketingHeaderWrapper";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

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
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Suspense fallback={<MarketingHeader locale={locale} user={null} />}><MarketingHeaderWrapper locale={locale} /></Suspense>

      <main className="min-h-screen" style={{ background: "var(--ivoire)" }}>

        {/* ── Breadcrumb ──────────────────────────────────────────── */}
        <div
          className="border-b px-4 py-3"
          style={{ borderColor: "var(--ivoire-border)", background: "var(--ivoire)" }}
        >
          <div className="mx-auto flex max-w-[1320px] items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
            <Link
              href="/search"
              locale={locale}
              className="flex items-center gap-1 transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--or)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Annonces
            </Link>
            <span style={{ color: "var(--ivoire-border)" }}>/</span>
            <span style={{ color: "var(--text-body)" }}>{listing.wilaya_name}</span>
            <span style={{ color: "var(--ivoire-border)" }}>/</span>
            <span className="max-w-[200px] truncate" style={{ color: "var(--text-dark)" }}>
              {listing.title}
            </span>
          </div>
        </div>

        {/* ── Photo gallery — full-bleed, hero ───────────────────── */}
        <div style={{ background: "var(--onyx)" }}>
          <div className="mx-auto max-w-[1320px]">
            <PhotoGallery media={listing.media} title={listing.title} />
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────── */}
        <div className="mx-auto max-w-[1320px] px-4 py-10">
          <div className="flex flex-col gap-10 lg:flex-row">

            {/* ── Main content ───────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Type chips */}
              <div className="mb-4 flex flex-wrap gap-2">
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                  style={{ background: "var(--amber-glow)", color: "var(--amber)" }}
                >
                  {tListings(listing.listing_type)}
                </span>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                  style={{ background: "var(--or-ghost)", color: "var(--or)" }}
                >
                  {tListings(listing.property_type)}
                </span>
              </div>

              {/* Agency + Reference */}
              <div className="mb-3 flex items-center gap-3 text-sm">
                <Link
                  href={`/a/${listing.agency_slug}`}
                  className="flex items-center gap-2 font-medium transition-colors"
                  style={{ color: "var(--text-body)" }}
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
                      style={{ background: "var(--or-ghost)", color: "var(--or)" }}
                    >
                      {listing.agency_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {listing.agency_name}
                </Link>
                <span style={{ color: "var(--ivoire-deep)" }}>·</span>
                <span className="font-mono text-xs" style={{ color: "var(--text-faint)" }}>
                  {formatListingRef(listing.reference_number)}
                </span>
              </div>

              {/* Editorial title — Libre Baskerville */}
              <h1
                className="mb-5 text-2xl font-bold leading-snug md:text-3xl"
                style={{
                  color: "var(--text-dark)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {listing.title}
              </h1>

              {/* Price block */}
              <div
                className="mb-6 inline-flex flex-col rounded-xl border px-5 py-4"
                style={{ background: "var(--bg-card)", borderColor: "var(--ivoire-border)" }}
              >
                <p className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-dark)" }}>
                  {formatPrice(listing.current_price, listing.currency)}
                </p>
                {listing.surface_m2 !== null && listing.surface_m2 > 0 && listing.current_price > 0 && (
                  <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                    <span style={{ color: "var(--or)", fontWeight: 600 }}>
                      {formatPrice(Math.round(listing.current_price / listing.surface_m2), listing.currency)}
                    </span>
                    {" "}/ m²
                  </p>
                )}
              </div>

              {/* Property details grid */}
              <div
                className="mb-8 grid grid-cols-2 gap-4 rounded-xl border p-5 sm:grid-cols-4"
                style={{ background: "var(--bg-card)", borderColor: "var(--ivoire-border)" }}
              >
                {listing.surface_m2 !== null && (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
                      {tListings("surface")}
                    </p>
                    <p className="text-base font-semibold" style={{ color: "var(--text-dark)" }}>
                      {listing.surface_m2} m²
                    </p>
                  </div>
                )}
                {listing.rooms !== null && (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
                      {tListings("rooms")}
                    </p>
                    <p className="text-base font-semibold" style={{ color: "var(--text-dark)" }}>
                      {listing.rooms}
                    </p>
                  </div>
                )}
                {listing.bathrooms !== null && (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
                      {tListings("bathrooms")}
                    </p>
                    <p className="text-base font-semibold" style={{ color: "var(--text-dark)" }}>
                      {listing.bathrooms}
                    </p>
                  </div>
                )}
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
                    {tListings("wilaya")}
                  </p>
                  <p className="text-base font-semibold" style={{ color: "var(--text-dark)" }}>
                    {listing.commune_name
                      ? `${listing.commune_name}, ${listing.wilaya_name}`
                      : listing.wilaya_name}
                  </p>
                </div>
              </div>

              {/* Description — editorial style */}
              {listing.description && (
                <div className="mb-8">
                  <h2
                    className="mb-4 text-xl font-bold"
                    style={{ color: "var(--text-dark)", fontFamily: "var(--font-display)" }}
                  >
                    Description
                  </h2>
                  <div
                    className="rounded-xl border p-5"
                    style={{ background: "var(--bg-card)", borderColor: "var(--ivoire-border)" }}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
                      {listing.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Details / Équipements */}
              {Object.keys(listing.details).length > 0 && (
                <div className="mb-8">
                  <h2
                    className="mb-4 text-xl font-bold"
                    style={{ color: "var(--text-dark)", fontFamily: "var(--font-display)" }}
                  >
                    {tListings("details")}
                  </h2>
                  <div
                    className="grid grid-cols-2 gap-3 rounded-xl border p-5 sm:grid-cols-3"
                    style={{ background: "var(--bg-card)", borderColor: "var(--ivoire-border)" }}
                  >
                    {Object.entries(listing.details).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <span
                          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                          style={{ background: "var(--or-ghost)" }}
                        >
                          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} style={{ color: "var(--or)" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </span>
                        <div>
                          <p className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>
                            {key.replace(/_/g, " ")}
                          </p>
                          <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>
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

            {/* ── Sidebar ─────────────────────────────────────────── */}
            <div className="w-full shrink-0 lg:w-[340px]">
              <div className="sticky top-20 space-y-4">

                {/* Agency contact card — JE style */}
                <div
                  className="overflow-hidden rounded-xl border"
                  style={{ background: "var(--bg-card)", borderColor: "var(--ivoire-border)" }}
                >
                  {/* Card header */}
                  <div
                    className="border-b px-5 py-4"
                    style={{ borderColor: "var(--ivoire-border)" }}
                  >
                    <div className="flex items-center gap-3">
                      {listing.agency_logo_url ? (
                        <img
                          src={listing.agency_logo_url}
                          alt={listing.agency_name}
                          className="h-12 w-12 rounded-xl object-cover"
                          style={{ boxShadow: "var(--shadow-sm)" }}
                        />
                      ) : (
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold"
                          style={{ background: "var(--or-ghost)", color: "var(--or)" }}
                        >
                          {listing.agency_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold" style={{ color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>
                          {listing.agency_name}
                        </h3>
                        <Link
                          href={`/a/${listing.agency_slug}`}
                          className="text-xs transition-colors"
                          style={{ color: "var(--or)" }}
                        >
                          Voir la vitrine →
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* CTA buttons */}
                  <div className="p-5 space-y-3">
                    {listing.agency_phone ? (
                      <a
                        href={`tel:${listing.agency_phone}`}
                        className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                        style={{ background: "var(--onyx)", color: "var(--ivoire)" }}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        {t("contact_agency")}
                      </a>
                    ) : (
                      <Link
                        href={`/a/${listing.agency_slug}`}
                        className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                        style={{ background: "var(--onyx)", color: "var(--ivoire)" }}
                      >
                        {t("contact_agency")}
                      </Link>
                    )}

                    <Link
                      href={`/a/${listing.agency_slug}`}
                      className="flex w-full items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
                      style={{ borderColor: "var(--ivoire-border)", color: "var(--text-body)", background: "var(--ivoire)" }}
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
        </div>
      </main>

      <MarketingFooter locale={locale} />
    </>
  );
}
