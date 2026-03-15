import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Suspense } from "react";
import { MarketingHeaderWrapper } from "@/components/marketing/MarketingHeaderWrapper";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; wilaya?: string }>;
}

export const metadata = { title: "Agences immobilières · AqarVision" };

export default async function AgencesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { q, wilaya } = await searchParams;
  setRequestLocale(locale);

  const supabase = await createClient();

  let query = supabase
    .from("agencies")
    .select("id, name, slug, logo_url, city, wilaya_code, description, is_verified")
    .eq("is_active", true)
    .order("is_verified", { ascending: false })
    .order("name");

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }
  if (wilaya) {
    query = query.eq("wilaya_code", wilaya);
  }

  const { data: agencies } = await query.limit(60);

  return (
    <>
      <Suspense fallback={<MarketingHeader locale={locale} user={null} />}><MarketingHeaderWrapper locale={locale} /></Suspense>
      <main className="bg-zinc-50">
        {/* Header */}
        <div className="border-b border-zinc-950 bg-zinc-950 py-16">
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

            {/* Search input */}
            <form className="mt-6 flex max-w-lg gap-3">
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Nom de l'agence, ville…"
                className="flex-1 rounded-md px-4 py-2.5 text-sm text-zinc-50 focus:outline-none"
                style={{
                  background: "rgba(250,250,250,0.08)",
                  border: "1px solid rgba(250,250,250,0.15)",
                }}
              />
              <button
                type="submit"
                className="rounded-md bg-zinc-50 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-85"
              >
                Rechercher
              </button>
            </form>
          </div>
        </div>

        {/* Grid */}
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
          {!agencies || agencies.length === 0 ? (
            <p className="py-16 text-center text-sm text-zinc-400">
              Aucune agence trouvée.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {agencies.map((agency) => (
                <Link
                  key={agency.id}
                  href={`/a/${agency.slug}`}
                  locale={locale}
                  className="group flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-500 hover:shadow-md"
                >
                  {/* Logo */}
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100"
                  >
                    {agency.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={agency.logo_url} alt={agency.name} className="h-full w-full object-contain p-1" />
                    ) : (
                      <svg className="h-7 w-7 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                      </svg>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {agency.name}
                      </p>
                      {agency.is_verified && (
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="#f59e0b">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    {agency.city && (
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {agency.city}
                      </p>
                    )}
                    {agency.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-600">
                        {agency.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
                    Voir la vitrine
                    <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
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
