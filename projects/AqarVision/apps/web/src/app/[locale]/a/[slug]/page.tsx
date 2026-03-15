import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getAgencyPublic,
  searchListings,
} from "@/features/marketplace/services/search.service";
import { resolveManifest, resolveThemeColors } from "@/lib/themes";
import { SectionRenderer } from "@/components/agency/ThemeRenderer";
import { Link } from "@/lib/i18n/navigation";

interface AgencyPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: AgencyPageProps) {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const agency = await getAgencyPublic(supabase, slug);

  if (!agency) return { title: "Not found" };

  return {
    title: agency.name,
    description: agency.description ?? `${agency.name} - AqarVision`,
    alternates: {
      languages: {
        fr: `/fr/a/${slug}`,
        ar: `/ar/a/${slug}`,
        en: `/en/a/${slug}`,
        es: `/es/a/${slug}`,
      },
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

export default async function AgencyPublicPage({ params }: AgencyPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "search" });
  const tListings = await getTranslations({ locale, namespace: "listings" });
  const tAgencies = await getTranslations({ locale, namespace: "agencies" });

  const supabase = await createClient();
  const agency = await getAgencyPublic(supabase, slug);
  if (!agency) notFound();

  // Resolve manifest & colors
  const manifest = resolveManifest(agency.theme);
  const colors = resolveThemeColors(manifest, {
    primary_color: agency.primary_color,
    accent_color: agency.accent_color,
    secondary_color: agency.secondary_color,
  });

  // Fetch agency listings
  const listingsResult = await searchListings(supabase, {
    locale: locale as "fr" | "ar" | "en" | "es",
    page: 1,
    page_size: 12,
  });
  const agencyListings = listingsResult.results.filter(
    (l) => l.agency_id === agency.id
  );

  // Split manifest sections around the listings section
  const listingsSection = manifest.sections.find((s) => s.id === "listings");
  const listingsOrder = listingsSection?.order ?? 999;
  const beforeSections = manifest.sections
    .filter((s) => s.id !== "listings" && s.order < listingsOrder)
    .sort((a, b) => a.order - b.order);
  const afterSections = manifest.sections
    .filter((s) => s.id !== "listings" && s.order > listingsOrder)
    .sort((a, b) => a.order - b.order);

  const isDark = manifest.style.themeMode === "dark";
  const bgColor = isDark ? colors.primary : "#f7fafc";
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "#ffffff";
  const textPrimary = isDark ? "#ffffff" : colors.primary;
  const textSecondary = isDark ? "rgba(255,255,255,0.6)" : "#718096";

  return (
    <div style={{ background: bgColor }}>
      {/* Hero, About, etc. (before listings) */}
      {beforeSections.map((section) => (
        <SectionRenderer key={section.id} section={section} agency={agency} />
      ))}

      {/* Listings + Contact sidebar */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Listings grid */}
          <div className="flex-1">
            <h2
              className="mb-5 text-lg font-semibold"
              style={{ color: textPrimary }}
            >
              {tListings("title")}
            </h2>
            {agencyListings.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {agencyListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/l/${listing.slug}`}
                    className="group block overflow-hidden rounded-xl transition-shadow hover:shadow-lg"
                    style={{ background: cardBg, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-gray-200">
                      {listing.cover_url ? (
                        <img
                          src={listing.cover_url}
                          alt={listing.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center" style={{ color: textSecondary }}>
                          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <span
                        className="mb-1 inline-block rounded px-2 py-0.5 text-xs font-medium"
                        style={{ background: `${colors.accent}22`, color: colors.accent }}
                      >
                        {tListings(listing.property_type)}
                      </span>
                      <h3
                        className="mb-1 truncate text-sm font-semibold"
                        style={{ color: isDark ? "rgba(255,255,255,0.9)" : "#2d3748" }}
                      >
                        {listing.title}
                      </h3>
                      <p
                        className="text-lg font-bold"
                        style={{ color: colors.primary }}
                      >
                        {formatPrice(listing.current_price, listing.currency)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: textSecondary }}>
                {tListings("no_listings")}
              </p>
            )}
          </div>

          {/* Sidebar: contact + branches */}
          <div className="w-full shrink-0 lg:w-80">
            {/* Contact */}
            <div
              className="mb-6 rounded-xl p-5"
              style={{ background: cardBg, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
            >
              <h3 className="mb-3 text-sm font-semibold" style={{ color: textPrimary }}>
                {t("contact_agency")}
              </h3>
              {agency.phone && (
                <a
                  href={`tel:${agency.phone}`}
                  className="mb-2 block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: colors.primary }}
                >
                  {agency.phone}
                </a>
              )}
              {agency.email && (
                <a
                  href={`mailto:${agency.email}`}
                  className="block w-full rounded-lg border px-4 py-2.5 text-center text-sm font-medium transition-colors hover:opacity-80"
                  style={{ borderColor: colors.primary, color: colors.primary }}
                >
                  {agency.email}
                </a>
              )}
            </div>

            {/* Branches */}
            {agency.branches.length > 0 && (
              <div
                className="rounded-xl p-5"
                style={{ background: cardBg, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
              >
                <h3 className="mb-3 text-sm font-semibold" style={{ color: textPrimary }}>
                  {tAgencies("branches_title")}
                </h3>
                <div className="space-y-3">
                  {agency.branches.map((branch) => (
                    <div
                      key={branch.id}
                      className="rounded-lg p-3"
                      style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#f7fafc" }}
                    >
                      <p className="text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.9)" : "#2d3748" }}>
                        {branch.name}
                      </p>
                      <p className="text-xs" style={{ color: textSecondary }}>
                        {tAgencies("branch_wilaya")} {branch.wilaya_code}
                      </p>
                      {branch.address_text && (
                        <p className="text-xs" style={{ color: textSecondary }}>
                          {branch.address_text}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats, CTA, etc. (after listings) */}
      {afterSections.map((section) => (
        <SectionRenderer key={section.id} section={section} agency={agency} />
      ))}
    </div>
  );
}
