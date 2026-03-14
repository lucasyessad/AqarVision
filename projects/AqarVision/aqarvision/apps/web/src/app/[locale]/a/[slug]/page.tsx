import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAgencyPublic } from "@/features/marketplace/services/search.service";
import { searchListings } from "@/features/marketplace/services/search.service";
import { Link } from "@/lib/i18n/navigation";

interface AgencyPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: AgencyPageProps) {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const agency = await getAgencyPublic(supabase, slug);

  if (!agency) {
    return { title: "Not found" };
  }

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

  if (!agency) {
    notFound();
  }

  // Fetch agency published listings
  const listingsResult = await searchListings(supabase, {
    locale: locale as "fr" | "ar" | "en" | "es",
    page: 1,
    page_size: 12,
  });

  // Filter by agency (since searchListings does not support agency filter directly)
  const agencyListings = listingsResult.results.filter(
    (l) => l.agency_id === agency.id
  );

  return (
    <main className="min-h-screen bg-[#f7fafc]">
      {/* Agency header */}
      <div className="bg-[#1a365d]">
        {agency.cover_url && (
          <div className="mx-auto max-w-7xl">
            <div className="aspect-[21/6] overflow-hidden">
              <img
                src={agency.cover_url}
                alt={agency.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center gap-4">
            {agency.logo_url ? (
              <img
                src={agency.logo_url}
                alt={agency.name}
                className="h-16 w-16 rounded-full border-2 border-white object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#d4af37] text-2xl font-bold text-[#1a365d]">
                {agency.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-white md:text-3xl">
                {agency.name}
                {agency.is_verified && (
                  <svg
                    className="h-5 w-5 text-[#d4af37]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </h1>
              {agency.description && (
                <p className="mt-1 text-sm text-white/80">
                  {agency.description}
                </p>
              )}
              <p className="mt-1 text-xs text-white/60">
                {agency.listing_count} {tListings("title").toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main: listings */}
          <div className="flex-1">
            <h2 className="mb-4 text-lg font-semibold text-[#2d3748]">
              {tListings("title")}
            </h2>
            {agencyListings.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {agencyListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/l/${listing.slug}`}
                    className="group block rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="aspect-[16/10] overflow-hidden rounded-t-xl bg-gray-200">
                      {listing.cover_url ? (
                        <img
                          src={listing.cover_url}
                          alt={listing.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <svg
                            className="h-10 w-10"
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
                    <div className="p-4">
                      <span className="mb-1 inline-block rounded bg-[#d4af37]/15 px-2 py-0.5 text-xs font-medium text-[#d4af37]">
                        {tListings(listing.property_type)}
                      </span>
                      <h3 className="mb-1 truncate text-sm font-semibold text-[#2d3748]">
                        {listing.title}
                      </h3>
                      <p className="text-lg font-bold text-[#1a365d]">
                        {formatPrice(listing.current_price, listing.currency)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{tListings("no_listings")}</p>
            )}
          </div>

          {/* Sidebar: agency info + branches */}
          <div className="w-full shrink-0 lg:w-80">
            {/* Contact */}
            <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-[#1a365d]">
                {t("contact_agency")}
              </h3>
              {agency.phone && (
                <a
                  href={`tel:${agency.phone}`}
                  className="mb-2 block w-full rounded-lg bg-[#1a365d] px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-[#1a365d]/90"
                >
                  {agency.phone}
                </a>
              )}
              {agency.email && (
                <a
                  href={`mailto:${agency.email}`}
                  className="block w-full rounded-lg border border-[#1a365d] px-4 py-2.5 text-center text-sm font-medium text-[#1a365d] transition-colors hover:bg-[#1a365d]/5"
                >
                  {agency.email}
                </a>
              )}
            </div>

            {/* Branches */}
            {agency.branches.length > 0 && (
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-[#1a365d]">
                  {tAgencies("branches_title")}
                </h3>
                <div className="space-y-3">
                  {agency.branches.map((branch) => (
                    <div
                      key={branch.id}
                      className="rounded-lg bg-[#f7fafc] p-3"
                    >
                      <p className="text-sm font-medium text-[#2d3748]">
                        {branch.name}
                      </p>
                      <p className="text-xs text-[#a0aec0]">
                        {tAgencies("branch_wilaya")} {branch.wilaya_code}
                      </p>
                      {branch.address_text && (
                        <p className="text-xs text-[#a0aec0]">
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
      </div>
    </main>
  );
}
