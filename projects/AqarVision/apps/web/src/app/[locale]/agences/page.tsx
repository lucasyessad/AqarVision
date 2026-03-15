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
      <main style={{ background: "var(--ivoire)" }}>
        {/* Header */}
        <div
          className="border-b py-16"
          style={{ background: "var(--onyx)", borderColor: "var(--onyx-mid)" }}
        >
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="mb-3 flex items-center gap-3">
              <span className="inline-block h-px w-8" style={{ background: "var(--or)" }} />
              <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--or)" }}>
                Annuaire
              </p>
            </div>
            <h1
              className="text-3xl font-light sm:text-4xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--ivoire)" }}
            >
              <span style={{ fontStyle: "italic" }}>Trouver</span>{" "}
              <span style={{ fontWeight: 600 }}>une agence</span>
            </h1>
            <p className="mt-2 text-sm" style={{ color: "rgba(253,251,247,0.4)" }}>
              {agencies?.length ?? 0} agences référencées sur AqarVision
            </p>

            {/* Search input */}
            <form className="mt-6 flex max-w-lg gap-3">
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Nom de l'agence, ville…"
                className="flex-1 rounded-md px-4 py-2.5 text-sm focus:outline-none"
                style={{
                  background: "rgba(253,251,247,0.08)",
                  border: "1px solid rgba(253,251,247,0.15)",
                  color: "var(--ivoire)",
                }}
              />
              <button
                type="submit"
                className="rounded-md px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-85"
                style={{ background: "var(--ivoire)", color: "var(--onyx)" }}
              >
                Rechercher
              </button>
            </form>
          </div>
        </div>

        {/* Grid */}
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
          {!agencies || agencies.length === 0 ? (
            <p className="text-center text-sm py-16" style={{ color: "var(--text-faint)" }}>
              Aucune agence trouvée.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {agencies.map((agency) => (
                <Link
                  key={agency.id}
                  href={`/a/${agency.slug}`}
                  locale={locale}
                  className="group flex flex-col gap-4 rounded-lg border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--or)]"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--ivoire-border)",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  {/* Logo */}
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                    style={{ background: "var(--ivoire-deep)", border: "1px solid var(--ivoire-border)" }}
                  >
                    {agency.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={agency.logo_url} alt={agency.name} className="h-full w-full object-contain p-1" />
                    ) : (
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ color: "var(--ivoire-border)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                      </svg>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className="truncate text-sm font-semibold"
                        style={{ color: "var(--text-dark)" }}
                      >
                        {agency.name}
                      </p>
                      {agency.is_verified && (
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="var(--or)">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    {agency.city && (
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-faint)" }}>
                        {agency.city}
                      </p>
                    )}
                    {agency.description && (
                      <p
                        className="mt-2 text-xs leading-relaxed line-clamp-2"
                        style={{ color: "var(--text-body)" }}
                      >
                        {agency.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--or)" }}>
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
