import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";

export const revalidate = 3600;
import { Suspense } from "react";
import { MarketingHeaderWrapper } from "@/components/marketing/MarketingHeaderWrapper";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HomeSearchBar } from "@/components/marketing/HomeSearchBar";
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
  { code: "16", name: "Alger",       sub: "Capitale",          count: "4 200+" },
  { code: "31", name: "Oran",        sub: "Perle de l'Ouest",  count: "1 800+" },
  { code: "25", name: "Constantine", sub: "Ville des ponts",   count: "950+"   },
  { code: "23", name: "Annaba",      sub: "Côte Est",          count: "620+"   },
  { code: "15", name: "Tizi-Ouzou", sub: "Grande Kabylie",    count: "480+"   },
  { code: "19", name: "Sétif",       sub: "Hauts Plateaux",    count: "390+"   },
];

const TICKER_ITEMS = [
  "Alger · Villa · 85 000 000 DZD",
  "Oran · Appartement · 12 500 000 DZD",
  "Constantine · Terrain · 6 200 000 DZD",
  "Annaba · Villa · 42 000 000 DZD",
  "Tizi-Ouzou · Appartement · 9 800 000 DZD",
  "Sétif · Local commercial · 18 000 000 DZD",
  "Blida · Appartement · 14 500 000 DZD",
  "Béjaïa · Villa · 55 000 000 DZD",
];

const STATS = [
  { value: "12 000+", label: "Annonces actives",    mono: true },
  { value: "320+",    label: "Agences partenaires",  mono: true },
  { value: "58",      label: "Wilayas couvertes",   mono: true },
  { value: "< 48h",  label: "Mise en ligne",        mono: true },
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

  const [saleResult, rentResult, wilayas] = await Promise.all([
    searchListingsAction({ locale, page: 1, page_size: 9 }),
    searchListingsAction({ locale, page: 1, page_size: 5, listing_type: "rent" }),
    getWilayas(supabase),
  ]);

  const listings: SearchResultDto[] = saleResult.success ? saleResult.data.results : [];
  const rentListings: SearchResultDto[] = rentResult.success ? rentResult.data.results : [];
  const featured = listings[0] ?? null;
  const secondary = listings[1] ?? null;
  const trending = listings.slice(2, 8);
  const newest = rentListings.slice(0, 5);

  return (
    <>
      <Suspense fallback={<MarketingHeader locale={locale} user={null} />}><MarketingHeaderWrapper locale={locale} /></Suspense>

      <main>
        {/* ─────────────────────────────────────────── HERO ─── */}
        <section className="relative -mt-16 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950">
          {/* Background photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={process.env.NEXT_PUBLIC_HERO_BG_URL ?? "/images/hero-bg.jpg"}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.38]"
          />

          {/* Ambient gradient */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: [
                "radial-gradient(ellipse 60% 50% at 15% 30%, rgba(184,168,138,0.12) 0%, transparent 70%)",
                "radial-gradient(ellipse 40% 60% at 85% 70%, rgba(26,25,23,0.9) 0%, transparent 80%)",
              ].join(", "),
            }}
          />

          {/* Subtle grid */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(#D4D4D8 1px, transparent 1px), linear-gradient(90deg, #D4D4D8 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Content */}
          <div className="relative mx-auto flex w-full max-w-[1320px] flex-col items-center px-4 pb-12 pt-24 text-center sm:px-6 lg:px-8">
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
              className="mb-10 font-display font-light tracking-[-0.02em] text-zinc-50"
              style={{
                fontSize: "clamp(2.8rem, 6vw, 6rem)",
                lineHeight: 1.05,
                maxWidth: "900px",
              }}
            >
              <span className="italic">L&apos;art de trouver</span>
              <br />
              <span className="font-semibold not-italic">votre bien idéal</span>
            </h1>

            {/* Search bar */}
            <HomeSearchBar locale={locale} wilayas={wilayas} />

            {/* Subtitle */}
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-50/45">
              Appartements, villas, terrains — explorez l&apos;immobilier des 58
              wilayas d&apos;Algérie en temps réel.
            </p>

            {/* Quick tags */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {[
                { label: "Vente",        href: "/search?listing_type=sale" },
                { label: "Location",     href: "/search?listing_type=rent" },
                { label: "Appartements", href: "/search?property_type=apartment" },
                { label: "Villas",       href: "/search?property_type=villa" },
                { label: "Terrains",     href: "/search?property_type=terrain" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  locale={locale}
                  className="rounded-full border border-zinc-50/15 px-3 py-1 text-xs text-zinc-50/45 transition-all hover:border-amber-500 hover:text-zinc-50"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-50/25">
              Défiler
            </span>
            <div
              className="h-8 w-px"
              style={{ background: "linear-gradient(to bottom, rgba(184,168,138,0.4), transparent)" }}
            />
          </div>
        </section>

        {/* ──────────────────────────────────────── TICKER ─── */}
        <div className="overflow-hidden border-y border-zinc-800 bg-zinc-900 py-3">
          <div
            className="flex w-max gap-10 whitespace-nowrap"
            style={{ animation: "ticker 30s linear infinite" }}
          >
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="flex items-center gap-3">
                <span className="font-mono text-xs font-medium text-zinc-50/45">{item}</span>
                <span className="text-amber-500/40">·</span>
              </span>
            ))}
          </div>
          <style>{`
            @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
          `}</style>
        </div>

        {/* ──────────────────────────────── FEATURED GRID ─── */}
        {(featured || secondary) && (
          <section className="bg-zinc-50 py-20">
            <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
              {/* Section header */}
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
                  className="hidden items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:opacity-70 sm:inline-flex"
                >
                  Voir toutes les annonces
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>

              {/* Editorial grid */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
                {/* Big card */}
                {featured && (
                  <Link
                    href={`/l/${featured.slug}`}
                    locale={locale}
                    className="group relative overflow-hidden rounded-sm"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                      {featured.cover_url ? (
                        <img
                          src={featured.cover_url}
                          alt={featured.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                          <svg className="h-16 w-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={0.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                          </svg>
                        </div>
                      )}
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to top, rgba(13,13,13,0.75) 0%, transparent 50%)" }}
                      />
                      <div className="absolute inset-x-5 bottom-5">
                        <p className="font-display text-2xl font-semibold text-zinc-50">
                          {formatPrice(featured.current_price, featured.currency)}
                        </p>
                        <p className="mt-1 line-clamp-1 text-sm text-zinc-50/70">
                          {featured.title}
                        </p>
                        <p className="mt-0.5 text-xs text-amber-500">
                          {featured.wilaya_name}{featured.commune_name ? ` · ${featured.commune_name}` : ""}
                        </p>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Small card */}
                {secondary && (
                  <Link
                    href={`/l/${secondary.slug}`}
                    locale={locale}
                    className="group relative overflow-hidden rounded-sm"
                  >
                    <div className="relative h-full min-h-[280px] overflow-hidden bg-zinc-900">
                      {secondary.cover_url ? (
                        <img
                          src={secondary.cover_url}
                          alt={secondary.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-700">
                          <svg className="h-12 w-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={0.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
                          </svg>
                        </div>
                      )}
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to top, rgba(13,13,13,0.75) 0%, transparent 55%)" }}
                      />
                      <div className="absolute inset-x-5 bottom-5">
                        <p className="font-display text-xl font-semibold text-zinc-50">
                          {formatPrice(secondary.current_price, secondary.currency)}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-sm text-zinc-50/70">
                          {secondary.title}
                        </p>
                        <p className="mt-0.5 text-xs text-amber-500">
                          {secondary.wilaya_name}
                        </p>
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
                {/* Left description */}
                <div className="hidden w-[220px] shrink-0 flex-col justify-between lg:flex">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
                      Marché
                    </p>
                    <h2 className="mb-4 font-display text-4xl font-light leading-tight text-zinc-950">
                      Tendance
                    </h2>
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

                {/* Right: 2-row grid */}
                <div className="min-w-0 flex-1">
                  <div className="mb-6 flex items-center justify-between lg:hidden">
                    <h2 className="font-display text-2xl font-light text-zinc-950">
                      Tendance
                    </h2>
                    <Link href="/search" locale={locale} className="text-xs text-amber-500">
                      Voir tout →
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {trending.slice(0, 6).map((listing) => (
                      <Link
                        key={listing.id}
                        href={`/l/${listing.slug}`}
                        locale={locale}
                        className="group"
                      >
                        <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-sm bg-zinc-200">
                          {listing.cover_url ? (
                            <img
                              src={listing.cover_url}
                              alt={listing.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
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
                        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                          {listing.title}
                        </p>
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
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
                    Location
                  </p>
                  <h2 className="font-display text-3xl font-light text-zinc-950">
                    Nouvelles annonces
                  </h2>
                </div>
                <Link
                  href="/search?listing_type=rent&sort=newest"
                  locale={locale}
                  className="text-xs font-medium text-amber-500"
                >
                  Voir tout →
                </Link>
              </div>

              {/* Horizontal scroll */}
              <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
                {newest.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/l/${listing.slug}`}
                    locale={locale}
                    className="group w-[260px] shrink-0"
                  >
                    <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-sm bg-zinc-200">
                      {listing.cover_url ? (
                        <img
                          src={listing.cover_url}
                          alt={listing.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-300">
                          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12" />
                          </svg>
                        </div>
                      )}
                      <span className="absolute start-2 top-2 rounded-sm bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-zinc-950">
                        Nouveau
                      </span>
                    </div>
                    <p className="font-display text-base font-semibold text-zinc-950">
                      {formatPrice(listing.current_price, listing.currency)}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-zinc-500">
                      {listing.title}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-300">
                      {listing.wilaya_name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ──────────────────────────────── STATS ONYX ─── */}
        <section className="bg-zinc-950">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-px border-b border-zinc-800 lg:grid-cols-4">
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex flex-col justify-center px-8 py-12"
                  style={{ borderRight: i < 3 ? "1px solid #27272A" : undefined }}
                >
                  <p className="font-mono text-4xl font-light tracking-[-0.02em] text-zinc-50 sm:text-5xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-amber-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col items-start gap-8 py-16 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
                  Pour les professionnels
                </p>
                <h2 className="mt-3 font-display text-3xl font-light italic leading-snug text-zinc-50 sm:text-4xl">
                  Le portail des agences
                  <br />
                  <span className="font-semibold not-italic">
                    immobilières d&apos;Algérie
                  </span>
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-zinc-50/45">
                  Publiez vos annonces, gérez vos leads et analysez votre marché
                  avec les outils AqarPro.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/AqarPro/dashboard"
                  locale={locale}
                  className="inline-flex items-center gap-2 rounded-sm bg-zinc-50 px-8 py-3.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-85"
                >
                  Accéder à l&apos;espace pro
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link
                  href="/pricing"
                  locale={locale}
                  className="inline-flex items-center gap-2 rounded-sm border border-zinc-50/20 px-8 py-3.5 text-sm font-medium text-zinc-50/70 transition-opacity hover:opacity-70"
                >
                  Voir les tarifs
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────── MARCHÉS POPULAIRES ─── */}
        <section className="bg-zinc-50 py-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
                  Géographie
                </p>
                <h2 className="font-display text-3xl font-light text-zinc-950 sm:text-4xl">
                  Marchés actifs
                </h2>
              </div>
              <Link
                href="/search"
                locale={locale}
                className="hidden text-xs font-medium text-amber-500 sm:inline"
              >
                Toutes les wilayas →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {POPULAR_WILAYAS.map((city) => (
                <Link
                  key={city.code}
                  href={`/search?wilaya_code=${city.code}`}
                  locale={locale}
                  className="group flex flex-col gap-3 rounded-sm border border-zinc-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-amber-500 hover:shadow-md"
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-950">{city.name}</p>
                    <p className="mt-0.5 text-xs text-zinc-300">{city.sub}</p>
                  </div>
                  <p className="font-mono text-xs font-semibold text-amber-500">
                    {city.count}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter locale={locale} />
    </>
  );
}
