import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";
import { AqarBrandLogo } from "@/components/brand/AqarBrandLogo";
import { signOutAction } from "@/features/auth/actions/auth.action";
import { ChaabSidebarNav } from "./ChaabSidebarNav";

interface EspaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function EspaceLayout({ children, params }: EspaceLayoutProps) {
  const { locale } = await params;
  const t = await getTranslations("espace");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/AqarChaab/auth/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .single();

  const displayName = profile?.full_name || user.email?.split("@")[0] || "—";
  const initial = displayName.charAt(0).toUpperCase();

  const navItems = [
    {
      href: "/AqarChaab/espace",
      label: t("nav.home"),
      icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75",
    },
    {
      href: "/AqarChaab/espace/mes-annonces",
      label: "Mes annonces",
      icon: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12",
    },
    {
      href: "/AqarChaab/espace/messagerie",
      label: t("nav.messagerie"),
      icon: "M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z",
    },
    {
      href: "/favorites",
      label: t("nav.favorites"),
      icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
    },
    {
      href: "/AqarChaab/espace/alertes",
      label: t("nav.alertes"),
      icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0",
    },
    {
      href: "/AqarChaab/espace/collections",
      label: t("nav.collections"),
      icon: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z",
    },
    {
      href: "/AqarChaab/espace/historique",
      label: t("nav.historique"),
      icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      href: "/AqarChaab/espace/upgrade",
      label: "Augmenter mon quota",
      icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75",
    },
    {
      href: "/AqarChaab/espace/profil",
      label: t("nav.profil"),
      icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "var(--ivoire)" }}>

      {/* ── Sidebar desktop ── */}
      <aside
        className="hidden w-60 shrink-0 flex-col md:flex"
        style={{
          background: "var(--onyx)",
          borderRight: "1px solid rgba(253,251,247,0.06)",
        }}
      >
        {/* Header */}
        <div
          className="flex flex-col gap-3 px-5 py-5"
          style={{ borderBottom: "1px solid rgba(253,251,247,0.07)" }}
        >
          <AqarBrandLogo product="Chaab" size="sm" onDark />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[10px] font-medium transition-opacity hover:opacity-80"
            style={{ color: "rgba(253,251,247,0.35)" }}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Retour au portail
          </Link>
        </div>

        {/* Nav */}
        <ChaabSidebarNav items={navItems} />

        {/* User footer */}
        <div
          className="px-4 py-4"
          style={{ borderTop: "1px solid rgba(253,251,247,0.07)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{ background: "rgba(253,251,247,0.12)", color: "var(--ivoire)" }}
            >
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium" style={{ color: "var(--ivoire)" }}>
                {displayName}
              </p>
              <p className="truncate text-[10px]" style={{ color: "rgba(253,251,247,0.35)" }}>
                {user.email}
              </p>
            </div>
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="origin" value="/AqarChaab/espace" />
              <button
                type="submit"
                title="Se déconnecter"
                className="shrink-0 rounded-md p-1 transition-opacity hover:opacity-70"
                style={{ color: "rgba(253,251,247,0.35)" }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div
        className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3 md:hidden"
        style={{
          background: "var(--onyx)",
          borderBottom: "1px solid rgba(253,251,247,0.07)",
        }}
      >
        <Link href="/">
          <AqarBrandLogo product="Chaab" size="sm" onDark />
        </Link>
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
          style={{ background: "rgba(253,251,247,0.12)", color: "var(--ivoire)" }}
        >
          {initial}
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 flex md:hidden"
        style={{
          background: "var(--onyx)",
          borderTop: "1px solid rgba(253,251,247,0.07)",
        }}
      >
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href as "/"}
            className="flex flex-1 flex-col items-center gap-1 px-1 py-3 text-[10px] transition-opacity hover:opacity-80"
            style={{ color: "rgba(253,251,247,0.45)" }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto pt-14 pb-20 md:pt-0 md:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
