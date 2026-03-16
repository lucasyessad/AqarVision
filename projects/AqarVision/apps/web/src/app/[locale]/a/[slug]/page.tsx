import { cache } from "react";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getAgencyPublic,
  searchListings,
} from "@/features/marketplace/services/search.service";
import { getThemeComponent, AVAILABLE_THEME_IDS } from "@/components/agency/themes";
import { ThemeLoader } from "@/components/agency/themes/ThemeLoader";

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

export default async function AgencyPublicPage({ params }: AgencyPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const agency = await getCachedAgency(slug);
  if (!agency) notFound();

  const supabase = await createClient();

  // Fetch agency listings
  const listingsResult = await searchListings(supabase, {
    locale: locale as "fr" | "ar" | "en" | "es",
    agency_id: agency.id,
    page: 1,
    page_size: 12,
  });
  const agencyListings = listingsResult.results;

  // Resolve the theme component
  const themeId = agency.theme ?? "modern";
  const themeLoader = getThemeComponent(themeId);

  if (themeLoader) {
    return <ThemeLoader themeId={themeId} agency={agency} listings={agencyListings} locale={locale} />;
  }

  // Fallback: default rendering for themes without a custom component
  const { resolveManifest, resolveThemeColors } = await import("@/lib/themes");
  const { SectionRenderer } = await import("@/components/agency/ThemeRenderer");
  const { Link } = await import("@/lib/i18n/navigation");
  const NextImage = (await import("next/image")).default;
  const { ImageIcon } = await import("lucide-react");
  const { formatPrice } = await import("@/lib/format");
  const { Phone: PhoneIcon, Mail, MapPin } = await import("lucide-react");

  const manifest = resolveManifest(themeId);
  const colors = resolveThemeColors(manifest, {
    primary_color: agency.primary_color,
    accent_color: agency.accent_color,
    secondary_color: agency.secondary_color,
  });

  const listingsSection = manifest.sections.find((s) => s.id === "listings");
  const listingsOrder = listingsSection?.order ?? 999;
  const beforeSections = manifest.sections
    .filter((s) => s.id !== "listings" && s.order < listingsOrder)
    .sort((a, b) => a.order - b.order);
  const afterSections = manifest.sections
    .filter((s) => s.id !== "listings" && s.order > listingsOrder && !s.variant.startsWith("cta-"))
    .sort((a, b) => a.order - b.order);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950">
      {beforeSections.map((section) => (
        <SectionRenderer key={section.id} section={section} agency={agency} />
      ))}

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1">
            <h2 className="mb-5 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Mes annonces
            </h2>
            {agencyListings.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {agencyListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/annonce/${listing.slug}`}
                    className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                      {listing.cover_url ? (
                        <NextImage src={listing.cover_url} alt={listing.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-300 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-600">
                          <ImageIcon className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <span className="mb-1 inline-block rounded-lg bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                        {listing.property_type}
                      </span>
                      <h3 className="mb-1 truncate text-sm font-semibold text-zinc-700 dark:text-zinc-200">{listing.title}</h3>
                      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{formatPrice(listing.current_price, listing.currency)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-zinc-400">Aucune annonce publiée</p>
            )}
          </div>

          <div className="w-full shrink-0 lg:w-80">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
                <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Contacter l&apos;agence</h3>
                {agency.phone && (
                  <a href={`tel:${agency.phone}`} className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-50 transition-opacity hover:opacity-90 dark:bg-zinc-50 dark:text-zinc-950">
                    <PhoneIcon className="h-4 w-4" /> {agency.phone}
                  </a>
                )}
                {agency.email && (
                  <a href={`mailto:${agency.email}`} className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">
                    <Mail className="h-4 w-4" /> {agency.email}
                  </a>
                )}
              </div>
              {agency.branches.length > 0 && (
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
                  <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Succursales</h3>
                  <div className="space-y-3">
                    {agency.branches.map((b) => (
                      <div key={b.id}>
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{b.name}</p>
                        {b.address_text && (
                          <p className="flex items-start gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                            <MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {b.address_text}
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
      </section>

      {afterSections.map((section) => (
        <SectionRenderer key={section.id} section={section} agency={agency} />
      ))}
    </div>
  );
}
