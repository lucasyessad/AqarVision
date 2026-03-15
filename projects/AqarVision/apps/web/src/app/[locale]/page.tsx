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

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

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
          {/* Background photo — full-bleed */}
          <Image
            src={heroUrl}
            alt=""
            fill
            priority
            aria-hidden="true"
            className="pointer-events-none object-cover"
          />
          {/* Gradient overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(9,9,11,0.65) 0%, rgba(9,9,11,0.25) 40%, rgba(9,9,11,0.7) 100%)",
            }}
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
            <h1
              className="mb-8 font-bold text-zinc-50"
              style={{
                fontSize: "clamp(2.5rem, 8vw, 5rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                maxWidth: "750px",
              }}
            >
              Trouvez votre
              <br />
              <span className="text-amber-400">chez-vous</span>
              <br />
              en Algérie
            </h1>

            {/* Transaction pills */}
            <div className="mb-6 flex gap-2">
              {[
                { label: "🏠 Acheter", href: "/search?listing_type=sale", active: true },
                { label: "🔑 Louer",   href: "/search?listing_type=rent",    active: false },
                { label: "☀️ Vacances", href: "/search?listing_type=vacation", active: false },
              ].map(({ label, href, active }) => (
                <Link
                  key={label}
                  href={href}
                  locale={locale}
                  className="rounded-full px-5 py-2 text-sm font-medium transition-all"
                  style={{
                    background: active ? "#F59E0B" : "rgba(255,255,255,0.1)",
                    color: active ? "#FFF" : "rgba(255,255,255,0.65)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Search bar */}
            <HomeSearchBar locale={locale} wilayas={wilayas} />

            {/* Subtitle */}
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-50/45">
              Appartements, villas, terrains — explorez l&apos;immobilier des 58
              wilayas d&apos;Algérie en temps réel.
            </p>
          </div>

          {/* Scroll indicator — bouncing chevron */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div style={{ animation: "chevron-bounce 2.5s ease infinite" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
          <style>{`@keyframes chevron-bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(8px) } }`}</style>
        </section>

        {/* ─────────────────────── SPLIT EDITORIAL ─── */}
        <section className="grid min-h-[70vh] grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col justify-center bg-zinc-50 px-8 py-16 lg:px-16">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
              Explorer
            </p>
            <h2
              className="text-4xl font-bold leading-[1.08] text-zinc-950 lg:text-5xl"
              style={{ letterSpacing: "-0.03em" }}
            >
              Plus de 15 000 biens
              <br />
              dans <span className="text-amber-500">58 wilayas</span>
            </h2>
            <p className="mt-5 max-w-[420px] text-base leading-relaxed text-zinc-500">
              Des appartements au cœur d&apos;Alger aux villas de bord de mer à Tipaza,
              trouvez le bien qui correspond à votre projet de vie.
            </p>
            <Link
              href="/search"
              locale={locale}
              className="mt-7 inline-flex w-fit items-center gap-2 text-sm font-semibold text-amber-500 transition-opacity hover:opacity-70"
            >
              Explorer les annonces
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="relative min-h-[400px] overflow-hidden">
            <Image
              src={splitUrl}
              alt="Bel intérieur"
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* ──────────────────────── WILAYAS SCROLL ─── */}
        <section className="border-t border-zinc-100 bg-zinc-50 py-16">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <h2 className="mb-2 text-2xl font-bold text-zinc-950" style={{ letterSpacing: "-0.02em" }}>
              Explorez par région
            </h2>
            <p className="mb-7 text-sm text-zinc-400">Les wilayas les plus recherchées</p>
          </div>
          <div
            className="flex gap-3 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8"
            style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
          >
            {POPULAR_WILAYAS.map((city) => (
              <Link
                key={city.code}
                href={`/search?wilaya_code=${city.code}`}
                locale={locale}
                className="group shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ width: 200, scrollSnapAlign: "start" }}
              >
                <div className="flex h-[130px] items-center justify-center bg-zinc-100 text-3xl">
                  🏙️
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-zinc-950">{city.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">{city.count} annonces</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ──────────────────────────────── FEATURED GRID ─── */}
        {(featured || secondary) && (
          <section className="border-t border-zinc-100 bg-white py-20">
            <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
                    Sélection
                  </p>
                  <h2 className="font-display text-3xl font-light italic text-zinc-950 sm:text-4xl">
                    À la une
                  </h2>
                </div>
                <Link
                  href="/search"
                  locale={locale}
                  className="hidden items-center gap-1.5 text-sm font-medium text-zinc-500 transition-opacity hover:opacity-70 sm:inline-flex"
                >
                  Voir toutes les annonces
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
                {featured && (
                  <Link href={`/l/${featured.slug}`} locale={locale} className="group relative overflow-hidden rounded-xl">
                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                      {featured.cover_url ? (
                        <img src={featured.cover_url} alt={featured.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                          <svg className="h-16 w-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={0.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(9,9,11,0.75) 0%, transparent 50%)" }} />
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
                  <Link href={`/l/${secondary.slug}`} locale={locale} className="group relative overflow-hidden rounded-xl">
                    <div className="relative h-full min-h-[280px] overflow-hidden bg-zinc-900">
                      {secondary.cover_url ? (
                        <img src={secondary.cover_url} alt={secondary.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-700">
                          <svg className="h-12 w-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={0.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(9,9,11,0.75) 0%, transparent 55%)" }} />
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
          <section className="border-t border-zinc-200 bg-zinc-50 py-20">
            <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
              <div className="flex gap-10 lg:gap-20">
                <div className="hidden w-[220px] shrink-0 flex-col justify-between lg:flex">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">Marché</p>
                    <h2 className="mb-4 font-display text-4xl font-light leading-tight text-zinc-950">Tendance</h2>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      Les biens qui retiennent l&apos;attention sur le marché algérien en ce moment.
                    </p>
                  </div>
                  <Link
                    href="/search"
                    locale={locale}
                    className="inline-flex w-fit items-center gap-1.5 border-b border-zinc-950 pb-0.5 text-xs font-semibold text-zinc-950 transition-opacity hover:opacity-60"
                  >
                    Voir tout
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-6 flex items-center justify-between lg:hidden">
                    <h2 className="font-display text-2xl font-light text-zinc-950">Tendance</h2>
                    <Link href="/search" locale={locale} className="text-xs text-amber-500">Voir tout →</Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {trending.slice(0, 6).map((listing) => (
                      <Link key={listing.id} href={`/l/${listing.slug}`} locale={locale} className="group">
                        <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-zinc-200">
                          {listing.cover_url ? (
                            <img src={listing.cover_url} alt={listing.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-zinc-300">
                              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="font-display text-sm font-semibold text-zinc-950">
                          {formatPrice(listing.current_price, listing.currency)}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{listing.title}</p>
                        <p className="text-xs text-zinc-300">
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
          <section className="border-t border-zinc-200 bg-zinc-100 py-20">
            <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">Location</p>
                  <h2 className="font-display text-3xl font-light text-zinc-950">Nouvelles annonces</h2>
                </div>
                <Link href="/search?listing_type=rent&sort=newest" locale={locale} className="text-xs font-medium text-amber-500">
                  Voir tout →
                </Link>
              </div>
              <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
                {newest.map((listing) => (
                  <Link key={listing.id} href={`/l/${listing.slug}`} locale={locale} className="group w-[260px] shrink-0">
                    <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-zinc-200">
                      {listing.cover_url ? (
                        <img src={listing.cover_url} alt={listing.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-300">
                          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12" />
                          </svg>
                        </div>
                      )}
                      <span className="absolute start-2 top-2 rounded-lg bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-zinc-950">
                        Nouveau
                      </span>
                    </div>
                    <p className="font-display text-base font-semibold text-zinc-950">
                      {formatPrice(listing.current_price, listing.currency)}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-zinc-500">{listing.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-300">{listing.wilaya_name}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ──────────────────── FULL-BLEED PHOTO ─── */}
        <section className="relative overflow-hidden" style={{ height: "60vh" }}>
          <Image
            src={fullbleedUrl}
            alt=""
            fill
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(transparent 30%, rgba(9,9,11,0.8))" }}
          />
          <div className="absolute bottom-0 start-0 p-8 lg:p-16">
            <h2
              className="max-w-[550px] text-3xl font-bold leading-[1.1] text-zinc-50 sm:text-4xl lg:text-5xl"
              style={{ letterSpacing: "-0.02em" }}
            >
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ──────────────────────────────── STATS STRIP ─── */}
        <section className="bg-zinc-950 py-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <h2
              className="mb-12 text-center text-3xl font-bold text-zinc-50 sm:text-4xl"
              style={{ letterSpacing: "-0.02em" }}
            >
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
                  <p className="text-3xl font-bold text-amber-400 sm:text-4xl" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────────────────── CTA PRO ─── */}
        <section className="bg-zinc-50 py-20 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
            Pour les professionnels
          </p>
          <h2
            className="text-3xl font-bold text-zinc-950 sm:text-4xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            Gérez votre agence
            <br />
            avec <span className="text-amber-500">AqarPro</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-base text-zinc-500">
            Dashboard, CRM, analytics, vitrine personnalisée, IA intégrée.
            Tout ce dont votre agence a besoin.
          </p>
          <Link
            href="/AqarPro/dashboard"
            locale={locale}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-amber-600"
          >
            Découvrir AqarPro →
          </Link>
        </section>
      </main>

      <MarketingFooter locale={locale} />
    </>
  );
}
