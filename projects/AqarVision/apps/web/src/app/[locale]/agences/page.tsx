import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Suspense } from "react";
import { MarketingHeaderWrapper } from "@/components/marketing/MarketingHeaderWrapper";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; wilaya?: string; verified?: string }>;
}

export const metadata = { title: "Agences immobilières · AqarVision" };

export default async function AgencesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { q, wilaya, verified } = await searchParams;
  setRequestLocale(locale);

  const supabase = await createClient();

  let query = supabase
    .from("agencies")
    .select("id, name, slug, logo_url, city, wilaya_code, description, is_verified, specialty")
    .eq("is_active", true)
    .order("is_verified", { ascending: false })
    .order("name");

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }
  if (wilaya) {
    query = query.eq("wilaya_code", wilaya);
  }
  if (verified === "true") {
    query = query.eq("is_verified", true);
  }

  const { data: agencies } = await query.limit(80);

  return (
    <>
      <Suspense fallback={<MarketingHeader locale={locale} user={null} />}>
        <MarketingHeaderWrapper locale={locale} />
      </Suspense>

      <main className="min-h-screen bg-zinc-50">
        {/* Header */}
        <div className="border-b border-zinc-800 bg-zinc-950 py-16">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="mb-3 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-amber-500" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-500">
                Annuaire
              </p>
            </div>
            <h1 className="font-display text-3xl font-light text-zinc-50 sm:text-4xl">
              <span className="italic">Trouver</span>{" "}
              <span className="font-semibold">une agence</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-50/40">
              {agencies?.length ?? 0} agences référencées sur AqarVision
            </p>

            {/* Filters */}
            <form className="mt-6 flex flex-wrap items-center gap-3">
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Nom de l'agence, ville…"
                className="w-64 rounded-md border border-white/15 bg-white/8 px-4 py-2.5 text-sm text-zinc-50 placeholder:text-zinc-400 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
              />
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  name="verified"
                  value="true"
                  defaultChecked={verified === "true"}
                  className="h-4 w-4 rounded border-zinc-600 accent-amber-500"
                />
                Vérifiées uniquement
              </label>
              <button
                type="submit"
                className="rounded-md bg-zinc-50 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-85"
              >
                Rechercher
              </button>
            </form>
          </div>
        </div>

        {/* Agency list */}
        <div className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
          {!agencies || agencies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                <svg className="h-8 w-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-700">Aucune agence trouvée</p>
              <p className="mt-1 text-xs text-zinc-400">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white">
              {agencies.map((agency) => (
                <Link
                  key={agency.id}
                  href={`/a/${agency.slug}`}
                  locale={locale}
                  className="group flex items-center gap-5 px-6 py-5 transition-colors hover:bg-zinc-50"
                >
                  {/* Logo */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-100 bg-gradient-to-br from-zinc-100 to-zinc-200">
                    {agency.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={agency.logo_url} alt={agency.name} className="h-full w-full object-contain p-1" />
                    ) : (
                      <span className="text-lg font-bold text-zinc-400">
                        {agency.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Main info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-zinc-900">{agency.name}</p>
                      {agency.is_verified && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Vérifiée
                        </span>
                      )}
                      {agency.city && (
                        <span className="text-xs text-zinc-400">{agency.city}</span>
                      )}
                    </div>
                    {agency.description && (
                      <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-zinc-500">
                        {agency.description}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg
                    className="h-4 w-4 shrink-0 text-zinc-300 transition-colors group-hover:text-amber-500"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <MarketingFooter locale={locale} />
    </>
  );
}
