import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

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
      languages: {
        fr: `/fr`,
        ar: `/ar`,
        en: `/en`,
        es: `/es`,
      },
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

  const t = await getTranslations({ locale, namespace: "homepage" });

  const stats = [
    { value: "12k+", labelKey: "stats.listings" },
    { value: "320+", labelKey: "stats.agencies" },
    { value: "48", labelKey: "stats.wilayas" },
    { value: "800+", labelKey: "stats.transactions" },
  ] as const;

  const cities = [
    { name: "Alger", wilaya: "16", emoji: "🏙️" },
    { name: "Oran", wilaya: "31", emoji: "🌊" },
    { name: "Constantine", wilaya: "25", emoji: "🌉" },
    { name: "Annaba", wilaya: "23", emoji: "🏖️" },
    { name: "Tizi-Ouzou", wilaya: "15", emoji: "🏔️" },
    { name: "Sétif", wilaya: "19", emoji: "🌾" },
  ];

  const propertyTypes = [
    { value: "apartment", label: "Appartement" },
    { value: "villa", label: "Villa" },
    { value: "terrain", label: "Terrain" },
    { value: "commercial", label: "Local commercial" },
    { value: "office", label: "Bureau" },
  ];

  return (
    <>
      <MarketingHeader locale={locale} />

      <main>
        {/* ─── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-blue-night px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          {/* Decorative background gradient */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,175,55,0.15),_transparent_60%)]"
          />

          <div className="relative mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
            <p className="mt-6 text-lg text-blue-200 sm:text-xl">
              {t("subtitle")}
            </p>

            {/* Search bar */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <div className="flex flex-1 flex-col gap-3 rounded-2xl bg-white p-3 shadow-xl sm:flex-row sm:items-center sm:gap-0 sm:p-1">
                {/* Wilaya selector (static for now — driven by URL params on search page) */}
                <select
                  name="wilaya"
                  defaultValue=""
                  aria-label={t("search_bar.wilaya_placeholder")}
                  className="flex-1 rounded-xl border-0 bg-transparent px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-night/20"
                >
                  <option value="" disabled>
                    {t("search_bar.wilaya_placeholder")}
                  </option>
                  {cities.map((c) => (
                    <option key={c.wilaya} value={c.wilaya}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <div className="hidden h-8 w-px bg-gray-200 sm:block" />

                {/* Property type selector */}
                <select
                  name="property_type"
                  defaultValue=""
                  aria-label={t("search_bar.type_placeholder")}
                  className="flex-1 rounded-xl border-0 bg-transparent px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-night/20"
                >
                  <option value="" disabled>
                    {t("search_bar.type_placeholder")}
                  </option>
                  {propertyTypes.map((pt) => (
                    <option key={pt.value} value={pt.value}>
                      {pt.label}
                    </option>
                  ))}
                </select>

                <Link
                  href="/search"
                  locale={locale}
                  className="rounded-xl bg-blue-night px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-night/90 sm:ms-1"
                >
                  {t("search_bar.button")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Stats ─────────────────────────────────────────────────────── */}
        <section className="border-b border-gray-100 bg-white px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.labelKey} className="text-center">
                <p className="text-3xl font-bold text-blue-night sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-gray-500">{t(stat.labelKey)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Popular cities ─────────────────────────────────────────────── */}
        <section className="bg-off-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-blue-night sm:text-3xl">
                {t("cities.title")}
              </h2>
              <p className="mt-2 text-gray-500">{t("cities.subtitle")}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {cities.map((city) => (
                <Link
                  key={city.wilaya}
                  href={`/search?wilaya_code=${city.wilaya}`}
                  locale={locale}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-gold hover:shadow-md"
                >
                  <span className="text-3xl" role="img" aria-label={city.name}>
                    {city.emoji}
                  </span>
                  <span className="text-sm font-semibold text-blue-night group-hover:text-gold">
                    {city.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Advantages ─────────────────────────────────────────────────── */}
        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold text-blue-night sm:text-3xl">
                {t("advantages.title")}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Card: Verified */}
              <div className="rounded-2xl border border-gray-100 bg-off-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-night/10">
                  <svg
                    className="h-7 w-7 text-blue-night"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-blue-night">
                  {t("advantages.verified_title")}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {t("advantages.verified_desc")}
                </p>
              </div>

              {/* Card: AI */}
              <div className="rounded-2xl border border-gold/30 bg-off-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
                  <svg
                    className="h-7 w-7 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-blue-night">
                  {t("advantages.ai_title")}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {t("advantages.ai_desc")}
                </p>
              </div>

              {/* Card: Agencies */}
              <div className="rounded-2xl border border-gray-100 bg-off-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-night/10">
                  <svg
                    className="h-7 w-7 text-blue-night"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-blue-night">
                  {t("advantages.agencies_title")}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {t("advantages.agencies_desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── ProBanner ──────────────────────────────────────────────────── */}
        <section className="bg-blue-night px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              {t("pro_banner.title")}
            </h2>
            <p className="mt-4 text-blue-200">{t("pro_banner.subtitle")}</p>
            <Link
              href="/auth/login"
              locale={locale}
              className="mt-8 inline-flex items-center rounded-xl bg-gold px-8 py-3 font-semibold text-blue-night transition-opacity hover:opacity-90"
            >
              {t("pro_banner.cta")}
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter locale={locale} />
    </>
  );
}
