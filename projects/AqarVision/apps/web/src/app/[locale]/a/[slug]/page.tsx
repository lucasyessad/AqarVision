import { cache } from "react";
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
import {
  Image,
  Phone as PhoneIcon,
  Mail,
  MapPin,
} from "lucide-react";

const getCachedAgency = cache(async (slug: string) => {
  const supabase = await createClient();
  return getAgencyPublic(supabase, slug);
});

interface AgencyPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: AgencyPageProps) {
  const { locale, slug } = await params;
  const agency = await getCachedAgency(slug);

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

  const agency = await getCachedAgency(slug);
  if (!agency) notFound();

  const supabase = await createClient();

  // Resolve manifest & colors
  const manifest = resolveManifest(agency.theme);
  const colors = resolveThemeColors(manifest, {
    primary_color: agency.primary_color,
    accent_color: agency.accent_color,
    secondary_color: agency.secondary_color,
  });

  // Fetch agency listings (filtered server-side by agency_id)
  const listingsResult = await searchListings(supabase, {
    locale: locale as "fr" | "ar" | "en" | "es",
    agency_id: agency.id,
    page: 1,
    page_size: 12,
  });
  const agencyListings = listingsResult.results;

  // Split manifest sections around the listings section
  const listingsSection = manifest.sections.find((s) => s.id === "listings");
  const listingsOrder = listingsSection?.order ?? 999;
  const beforeSections = manifest.sections
    .filter((s) => s.id !== "listings" && s.order < listingsOrder)
    .sort((a, b) => a.order - b.order);
  const afterSections = manifest.sections
    .filter(
      (s) =>
        s.id !== "listings" &&
        s.order > listingsOrder &&
        !s.variant.startsWith("cta-")
    )
    .sort((a, b) => a.order - b.order);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950">
      {/* Hero, About, etc. (before listings) */}
      {beforeSections.map((section) => (
        <SectionRenderer key={section.id} section={section} agency={agency} />
      ))}

      {/* Listings + Contact sidebar */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Listings grid */}
          <div className="flex-1">
            <h2 className="mb-5 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {tListings("title")}
            </h2>
            {agencyListings.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {agencyListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/annonce/${listing.slug}`}
                    className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                      {listing.cover_url ? (
                        <img
                          src={listing.cover_url}
                          alt={listing.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-zinc-600">
                          <Image className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <span className="mb-1 inline-block rounded-lg bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                        {tListings(listing.property_type)}
                      </span>
                      <h3 className="mb-1 truncate text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                        {listing.title}
                      </h3>
                      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                        {formatPrice(listing.current_price, listing.currency)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {tListings("no_listings")}
              </p>
            )}
          </div>

          {/* Sidebar: contact + branches */}
          <div className="w-full shrink-0 lg:w-80">
            {/* Contact */}
            <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {t("contact_agency")}
              </h3>
              {agency.phone && (
                <a
                  href={`tel:${agency.phone}`}
                  className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-center text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-zinc-50 dark:text-zinc-950"
                >
                  <PhoneIcon className="h-4 w-4" />
                  {agency.phone}
                </a>
              )}
              {agency.email && (
                <a
                  href={`mailto:${agency.email}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-2.5 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Mail className="h-4 w-4" />
                  {agency.email}
                </a>
              )}
            </div>

            {/* Branches */}
            {agency.branches.length > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {tAgencies("branches_title")}
                </h3>
                <div className="space-y-3">
                  {agency.branches.map((branch) => (
                    <div
                      key={branch.id}
                      className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800"
                    >
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                        {branch.name}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <MapPin className="h-3 w-3" />
                        {tAgencies("branch_wilaya")} {branch.wilaya_code}
                      </p>
                      {branch.address_text && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
