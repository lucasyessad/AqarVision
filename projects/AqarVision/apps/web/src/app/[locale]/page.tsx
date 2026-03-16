import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";

export const revalidate = 3600;
import { Suspense } from "react";
import { MarketingHeaderWrapper } from "@/components/marketing/MarketingHeaderWrapper";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HomeSearchBar } from "@/components/marketing/HomeSearchBar";
import Image from "next/image";
import { searchListingsAction } from "@/features/marketplace/actions/search.action";
import { getWilayas } from "@/features/marketplace/services/search.service";
import { createClient } from "@/lib/supabase/server";
import type { SearchResultDto } from "@/features/marketplace/types/search.types";
import { ChevronDown, ArrowRight, Home } from "lucide-react";
import { formatPrice } from "@/lib/format";

const POPULAR_WILAYAS = [
  { code: "16", name: "Alger",       count: "4 200+" },
  { code: "31", name: "Oran",        count: "1 800+" },
  { code: "25", name: "Constantine", count: "950+"   },
  { code: "23", name: "Annaba",      count: "620+"   },
  { code: "15", name: "Tizi-Ouzou", count: "480+"   },
  { code: "19", name: "Sétif",       count: "390+"   },
  { code: "09", name: "Blida",       count: "310+"   },
  { code: "06", name: "Béjaïa",      count: "280+"   },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "homepage" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      languages: { fr: "/fr", ar: "/ar", en: "/en", es: "/es" },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();

  const [saleResult, rentResult, wilayas, { data: editorialRows }] = await Promise.all([
    searchListingsAction({ locale, page: 1, page_size: 9 }),
    searchListingsAction({ locale, page: 1, page_size: 5, listing_type: "rent" }),
    getWilayas(supabase),
    supabase
      .from("platform_settings")
      .select("key, value")
      .in("key", ["editorial_hero_url", "editorial_split_url", "editorial_fullbleed_url"]),
  ]);

  const editorialUrls = Object.fromEntries(
    (editorialRows ?? []).map((r) => [
      r.key,
      typeof r.value === "string" && r.value !== "null" ? r.value : null,
    ])
  );
  const heroUrl = (editorialUrls.editorial_hero_url as string | null)
    ?? "https://picsum.photos/seed/aqar-hero/1600/900";
  const splitUrl = (editorialUrls.editorial_split_url as string | null)
    ?? "https://picsum.photos/seed/aqar-interior/900/700";
  const fullbleedUrl = (editorialUrls.editorial_fullbleed_url as string | null)
    ?? "https://picsum.photos/seed/aqar-city/1400/700";

  const listings: SearchResultDto[] = saleResult.success ? saleResult.data.results : [];
  const rentListings: SearchResultDto[] = rentResult.success ? rentResult.data.results : [];
  const featured = listings[0] ?? null;
  const secondary = listings[1] ?? null;
  const trending = listings.slice(2, 8);
  const newest = rentListings.slice(0, 5);

  return (
    <>
      <Suspense fallback={<MarketingHeader locale={locale} user={null} />}>
        <MarketingHeaderWrapper locale={locale} />
      </Suspense>

      <main>
        {/* ─────────────────────────────────────────── HERO ─── */}
        <section className="relative -mt-16 flex min-h-screen flex-col items-center justify-center overflow-hidden">
          {/* Background photo -- full-bleed */}
          <Image
            src={heroUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            aria-hidden="true"
            className="pointer-events-none object-cover"
          />
          {/* Gradient overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/65 via-black/25 to-black/70"
          />

          {/* Content */}
          <div className="relative z-10 mx-auto flex w-full max-w-[1320px] flex-col items-center px-4 pb-12 pt-24 text-center sm:px-6 lg:px-8">
            {/* Eyebrow */}
            <div className="mb-6 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-amber-500" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-500">
                Portail Immobilier · Algérie
              </p>
              <span className="inline-block h-px w-8 bg-amber-500" />
            </div>

            {/* Headline */}
            <h1 className="mb-8 max-w-[750px] text-5xl font-bold leading-[1.05] tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl">
              Trouvez votre
              <br />
              <span className="text-amber-400">chez-vous</span>
              <br />
              en Algérie
            </h1>

            {/* Transaction pills + Search bar (interactive) */}
            <HomeSearchBar locale={locale} wilayas={wilayas} />

            {/* Subtitle */}
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-50/45">
              Appartements, villas, terrains — explorez l&apos;immobilier des 58
              wilayas d&apos;Algérie en temps réel.
            </p>
          </div>

          {/* Scroll indicator -- bouncing chevron */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <ChevronDown className="h-5 w-5 animate-bounce text-white/40" />
          </div>
        </section>

        {/* ─────────────────────── SPLIT EDITORIAL ─── */}
        <section className="grid min-h-[70vh] grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col justify-center bg-zinc-50 px-8 py-16 dark:bg-zinc-900 lg:px-16">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
              Explorer
            </p>
            <h2 className="text-4xl font-bold leading-[1.08] tracking-tight text-zinc-950 dark:text-zinc-50 lg:text-5xl">
              Plus de 15 000 biens
              <br />
              dans <span className="text-amber-500">58 wilayas</span>
            </h2>
            <p className="mt-5 max-w-[420px] text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
              Des appartements au cœur d&apos;Alger aux villas de bord de mer à Tipaza,
              trouvez le bien qui correspond à votre projet de vie.
            </p>
            <Link
              href="/search"
              locale={locale}
              className="mt-7 inline-flex w-fit items-center gap-2 text-sm font-semibold text-amber-500 transition-opacity hover:opacity-70"
            >
              Explorer les annonces
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative min-h-[400px] overflow-hidden">
            <Image
              src={splitUrl}
              alt="Bel intérieur"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </section>

        {/* ──────────────────────── WILAYAS SCROLL ─── */}
        <section className="border-t border-zinc-100 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Explorez par région
            </h2>
            <p className="mb-7 text-sm text-zinc-400 dark:text-zinc-500">Les wilayas les plus recherchées</p>
          </div>
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto scrollbar-hide px-4 pb-4 sm:px-6 lg:px-8">
            {POPULAR_WILAYAS.map((city) => (
              <Link
                key={city.code}
                href={`/search?wilaya_code=${city.code}`}
                locale={locale}
                className="group w-[200px] shrink-0 snap-start overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all hover:-translate-y-1 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
              >
                <div className="flex h-[130px] items-center justify-center bg-zinc-100 text-3xl dark:bg-zinc-700">
                  <Home className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{city.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{city.count} annonces</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ──────────────────────────────── FEATURED GRID ─── */}
        {(featured || secondary) && (
          <section className="border-t border-zinc-100 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
                    Sélection
                  </p>
                  <h2 className="font-display text-3xl font-light italic text-zinc-950 dark:text-zinc-50 sm:text-4xl">
                    À la une
                  </h2>
                </div>
                <Link
                  href="/search"
                  locale={locale}
                  className="hidden items-center gap-1.5 text-sm font-medium text-zinc-500 transition-opacity hover:opacity-70 dark:text-zinc-400 sm:inline-flex"
                >
                  Voir toutes les annonces
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
                {featured && (
                  <Link href={`/annonce/${featured.slug}`} locale={locale} className="group relative overflow-hidden rounded-xl">
                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                      {featured.cover_url ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={featured.cover_url}
                            alt={featured.title}
                            fill
                            sizes="(min-width: 1024px) 60vw, 100vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                          <Home className="h-16 w-16 text-white opacity-20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/75 to-transparent" />
                      <div className="absolute inset-x-5 bottom-5">
                        <p className="font-display text-2xl font-semibold text-zinc-50">
                          {formatPrice(featured.current_price, featured.currency)}
                        </p>
                        <p className="mt-1 line-clamp-1 text-sm text-zinc-50/70">{featured.title}</p>
                        <p className="mt-0.5 text-xs text-amber-500">
                          {featured.wilaya_name}{featured.commune_name ? ` · ${featured.commune_name}` : ""}
                        </p>
                      </div>
                    </div>
                  </Link>
                )}

                {secondary && (
                  <Link href={`/annonce/${secondary.slug}`} locale={locale} className="group relative overflow-hidden rounded-xl">
                    <div className="relative h-full min-h-[280px] overflow-hidden bg-zinc-900">
                      {secondary.cover_url ? (
                        <Image
                          src={secondary.cover_url}
                          alt={secondary.title}
                          fill
                          sizes="(min-width: 1024px) 40vw, 100vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-700">
                          <Home className="h-12 w-12 text-white opacity-20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/75 to-transparent" />
                      <div className="absolute inset-x-5 bottom-5">
                        <p className="font-display text-xl font-semibold text-zinc-50">
                          {formatPrice(secondary.current_price, secondary.currency)}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-sm text-zinc-50/70">{secondary.title}</p>
                        <p className="mt-0.5 text-xs text-amber-500">{secondary.wilaya_name}</p>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ──────────────────────────────────────── TENDANCE ─── */}
        {trending.length > 0 && (
          <section className="border-t border-zinc-200 bg-zinc-50 py-20 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
              <div className="flex gap-10 lg:gap-20">
                <div className="hidden w-[220px] shrink-0 flex-col justify-between lg:flex">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">Marché</p>
                    <h2 className="mb-4 font-display text-4xl font-light leading-tight text-zinc-950 dark:text-zinc-50">Tendance</h2>
                    <p className="text-sm leading-relaxed text-zinc-400 dark:text-zinc-500">
                      Les biens qui retiennent l&apos;attention sur le marché algérien en ce moment.
                    </p>
                  </div>
                  <Link
                    href="/search"
                    locale={locale}
                    className="inline-flex w-fit items-center gap-1.5 border-b border-zinc-950 pb-0.5 text-xs font-semibold text-zinc-950 transition-opacity hover:opacity-60 dark:border-zinc-50 dark:text-zinc-50"
                  >
                    Voir tout
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-6 flex items-center justify-between lg:hidden">
                    <h2 className="font-display text-2xl font-light text-zinc-950 dark:text-zinc-50">Tendance</h2>
                    <Link href="/search" locale={locale} className="inline-flex items-center gap-1 text-xs text-amber-500">
                      Voir tout
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {trending.slice(0, 6).map((listing) => (
                      <Link key={listing.id} href={`/annonce/${listing.slug}`} locale={locale} className="group">
                        <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
                          {listing.cover_url ? (
                            <Image
                              src={listing.cover_url}
                              alt={listing.title}
                              fill
                              sizes="(min-width: 640px) 33vw, 50vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-zinc-300 dark:text-zinc-600">
                              <Home className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <p className="font-display text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                          {formatPrice(listing.current_price, listing.currency)}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">{listing.title}</p>
                        <p className="text-xs text-zinc-300 dark:text-zinc-600">
                          {listing.wilaya_name}{listing.commune_name ? `, ${listing.commune_name}` : ""}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────── NOUVELLES ANNONCES ─── */}
        {newest.length > 0 && (
          <section className="border-t border-zinc-200 bg-zinc-100 py-20 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">Location</p>
                  <h2 className="font-display text-3xl font-light text-zinc-950 dark:text-zinc-50">Nouvelles annonces</h2>
                </div>
                <Link href="/search?listing_type=rent&sort=newest" locale={locale} className="inline-flex items-center gap-1 text-xs font-medium text-amber-500">
                  Voir tout
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {newest.map((listing) => (
                  <Link key={listing.id} href={`/annonce/${listing.slug}`} locale={locale} className="group w-[260px] shrink-0">
                    <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
                      {listing.cover_url ? (
                        <Image
                          src={listing.cover_url}
                          alt={listing.title}
                          fill
                          sizes="260px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-300 dark:text-zinc-600">
                          <Home className="h-10 w-10" />
                        </div>
                      )}
                      <span className="absolute start-2 top-2 rounded-lg bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-zinc-950">
                        Nouveau
                      </span>
                    </div>
                    <p className="font-display text-base font-semibold text-zinc-950 dark:text-zinc-50">
                      {formatPrice(listing.current_price, listing.currency)}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-zinc-500 dark:text-zinc-400">{listing.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-300 dark:text-zinc-600">{listing.wilaya_name}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ──────────────────── FULL-BLEED PHOTO ─── */}
        <section className="relative h-[60vh] overflow-hidden">
          <Image
            src={fullbleedUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 start-0 p-8 lg:p-16">
            <h2 className="max-w-[550px] text-3xl font-bold leading-[1.1] tracking-tight text-zinc-50 sm:text-4xl lg:text-5xl">
              Chaque quartier
              <br />
              a son <span className="text-amber-400">caractère</span>
            </h2>
            <Link
              href="/search"
              locale={locale}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-400"
            >
              Rechercher par quartier
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ──────────────────────────────── STATS STRIP ─── */}
        <section className="bg-zinc-950 py-20 dark:bg-zinc-900">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
              La confiance de milliers
              <br />
              de familles algériennes
            </h2>
            <div className="mx-auto grid max-w-[800px] grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { value: "15 000+", label: "annonces" },
                { value: "58",      label: "wilayas" },
                { value: "2 500+", label: "agences vérifiées" },
                { value: "98%",     label: "satisfaction" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="tabular-nums text-3xl font-bold text-amber-400 sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────────────────── CTA PRO ─── */}
        <section className="bg-zinc-50 py-20 text-center dark:bg-zinc-900">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
            Pour les professionnels
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
            Gérez votre agence
            <br />
            avec <span className="text-amber-500">AqarPro</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-base text-zinc-500 dark:text-zinc-400">
            Dashboard, CRM, analytics, vitrine personnalisée, IA intégrée.
            Tout ce dont votre agence a besoin.
          </p>
          <Link
            href="/AqarPro/dashboard"
            locale={locale}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-amber-600"
          >
            Découvrir AqarPro
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <MarketingFooter locale={locale} />
    </>
  );
}
