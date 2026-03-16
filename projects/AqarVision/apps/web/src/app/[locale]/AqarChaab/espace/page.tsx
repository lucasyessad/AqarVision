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

  const [{ count: favoritesCount }, { count: savedSearchesCount }, { count: listingsCount }] =
    await Promise.all([
      supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      supabase.from("saved_searches").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      supabase.from("listings").select("id", { count: "exact", head: true }).eq("individual_owner_id", user!.id),
    ]);

  const displayName = profile?.full_name ?? user!.email ?? "";
  const firstName = displayName.split(" ")[0] ?? displayName;

  const cards = [
    {
      href: "/AqarChaab/espace/mes-annonces" as const,
      label: "Mes annonces",
      description: "Gérez vos annonces publiées",
      count: listingsCount ?? 0,
      icon: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12",
    },
    {
      href: "/favorites" as const,
      label: t("nav.favorites"),
      description: t("card_favorites_desc"),
      count: favoritesCount ?? 0,
      icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
    },
    {
      href: "/AqarChaab/espace/alertes" as const,
      label: t("nav.alertes"),
      description: t("card_alertes_desc"),
      count: savedSearchesCount ?? 0,
      icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0",
    },
    {
      href: "/AqarChaab/espace/historique" as const,
      label: t("nav.historique"),
      description: t("card_historique_desc"),
      count: null,
      icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  ];

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-amber-500">
          Espace Particulier
        </p>
        <h1 className="text-2xl font-light text-zinc-950 dark:text-zinc-50 font-display">
          <span className="italic">Bonjour,</span>{" "}
          <span className="font-semibold">{firstName}</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
          {t("welcome_subtitle")}
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col gap-3 rounded-xl p-4 transition-all hover:-translate-y-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 dark:bg-amber-500/10">
              <svg className="h-4 w-4 text-zinc-50 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
              </svg>
            </div>
            <div>
              {card.count !== null && (
                <p className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
                  {card.count}
                </p>
              )}
              <p className={`text-xs font-medium ${card.count !== null ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-950 dark:text-zinc-50"}`}>
                {card.label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Déposer une annonce */}
        <Link
          href="/deposer"
          className="group flex items-center gap-4 rounded-xl p-5 transition-all hover:-translate-y-0.5 bg-zinc-950 dark:bg-zinc-900 border border-zinc-50/[0.06] shadow-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-50/10">
            <svg className="h-5 w-5 text-zinc-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-zinc-50">
              Déposer une annonce
            </p>
            <p className="text-xs text-zinc-50/40">
              Vente, location, vacances — gratuit
            </p>
          </div>
          <svg
            className="ms-auto h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 text-zinc-50/30"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>

        {/* Rechercher */}
        <Link
          href="/search"
          className="group flex items-center gap-4 rounded-xl p-5 transition-all hover:-translate-y-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-50">
            <svg className="h-5 w-5 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-zinc-950 dark:text-zinc-50">
              {t("search_cta_title")}
            </p>
            <p className="text-xs text-zinc-400">
              {t("search_cta_subtitle")}
            </p>
          </div>
          <svg
            className="ms-auto h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 text-zinc-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
