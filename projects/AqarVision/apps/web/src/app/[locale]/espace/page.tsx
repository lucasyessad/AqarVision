import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";

interface EspacePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: EspacePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "espace" });
  return { title: t("page_title") };
}

export default async function EspacePage({ params }: EspacePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "espace" });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user!.id)
    .single();

  // Fetch quick stats
  const [{ count: favoritesCount }, { count: savedSearchesCount }] =
    await Promise.all([
      supabase
        .from("favorites")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id),
      supabase
        .from("saved_searches")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id),
    ]);

  const displayName = profile?.full_name ?? user!.email ?? "";

  const quickLinks = [
    {
      href: "/favorites" as const,
      label: t("nav.favorites"),
      count: favoritesCount ?? 0,
      description: t("card_favorites_desc"),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ),
      color: "text-red-500 bg-red-50",
    },
    {
      href: "/espace/alertes" as const,
      label: t("nav.alertes"),
      count: savedSearchesCount ?? 0,
      description: t("card_alertes_desc"),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      ),
      color: "text-amber-500 bg-amber-50",
    },
    {
      href: "/espace/historique" as const,
      label: t("nav.historique"),
      count: null,
      description: t("card_historique_desc"),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-blue-500 bg-blue-50",
    },
    {
      href: "/espace/profil" as const,
      label: t("nav.profil"),
      count: null,
      description: t("card_profil_desc"),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
      color: "text-emerald-500 bg-emerald-50",
    },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a365d]">
          {t("welcome_title", { name: displayName.split(" ")[0] ?? displayName })}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{t("welcome_subtitle")}</p>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className={`shrink-0 rounded-xl p-3 ${item.color}`}>
              {item.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#2d3748] group-hover:text-[#1a365d]">
                  {item.label}
                </span>
                {item.count !== null && item.count > 0 && (
                  <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#1a365d]/10 px-1.5 text-xs font-semibold text-[#1a365d]">
                    {item.count}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-gray-400">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Search CTA */}
      <div className="mt-8 rounded-xl bg-gradient-to-r from-[#1a365d] to-[#1a365d]/80 p-6 text-white">
        <h2 className="text-lg font-semibold">{t("search_cta_title")}</h2>
        <p className="mt-1 text-sm text-white/70">{t("search_cta_subtitle")}</p>
        <Link
          href="/search"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold/90"
        >
          {t("search_cta_button")}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
