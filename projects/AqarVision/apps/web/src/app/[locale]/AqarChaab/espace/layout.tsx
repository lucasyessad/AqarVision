import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";
import { AqarBrandLogo } from "@/components/brand/AqarBrandLogo";
import { signOutAction } from "@/features/auth/actions/auth.action";
import { ChaabSidebarNav } from "./ChaabSidebarNav";
import {
  Home, List, MessageSquare, Heart, Bell, FolderOpen, Clock, Banknote, User, ArrowLeft, LogOut,
} from "lucide-react";

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

  // Fetch membership and profile in parallel
  const [{ data: membership }, { data: profile }] = await Promise.all([
    supabase
      .from("agency_memberships")
      .select("agency_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single(),
  ]);

  // Pro users (agency members) must use AqarPro dashboard
  if (membership) {
    redirect(`/${locale}/AqarPro/dashboard`);
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "—";
  const initial = displayName.charAt(0).toUpperCase();

  const navItems = [
    {
      href: "/AqarChaab/espace",
      label: t("nav.home"),
      icon: <Home className="h-5 w-5" />,
    },
    {
      href: "/AqarChaab/espace/mes-annonces",
      label: t("nav.annonces"),
      icon: <List className="h-5 w-5" />,
    },
    {
      href: "/AqarChaab/espace/messagerie",
      label: t("nav.messagerie"),
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      href: "/favorites",
      label: t("nav.favorites"),
      icon: <Heart className="h-5 w-5" />,
    },
    {
      href: "/AqarChaab/espace/alertes",
      label: t("nav.alertes"),
      icon: <Bell className="h-5 w-5" />,
    },
    {
      href: "/AqarChaab/espace/collections",
      label: t("nav.collections"),
      icon: <FolderOpen className="h-5 w-5" />,
    },
    {
      href: "/AqarChaab/espace/historique",
      label: t("nav.historique"),
      icon: <Clock className="h-5 w-5" />,
    },
    {
      href: "/AqarChaab/espace/upgrade",
      label: t("nav.upgrade"),
      icon: <Banknote className="h-5 w-5" />,
    },
    {
      href: "/AqarChaab/espace/profil",
      label: t("nav.profil"),
      icon: <User className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-800 dark:bg-zinc-950">

      {/* -- Sidebar desktop -- */}
      <aside className="hidden w-60 shrink-0 flex-col border-e border-zinc-800/60 bg-zinc-950 dark:bg-zinc-900 md:flex">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-zinc-800/60 px-5 py-5">
          <AqarBrandLogo product="Chaab" size="sm" onDark />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="h-3 w-3" />
            {t("nav.back_portal")}
          </Link>
        </div>

        {/* Nav */}
        <ChaabSidebarNav items={navItems} />

        {/* User footer */}
        <div className="border-t border-zinc-800/60 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-100">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-zinc-100">
                {displayName}
              </p>
              <p className="truncate text-[10px] text-zinc-500">
                {user.email}
              </p>
            </div>
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="origin" value="/AqarChaab/espace" />
              <button
                type="submit"
                title={t("nav.logout")}
                className="shrink-0 rounded-lg p-1 text-zinc-500 transition-opacity hover:opacity-70"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* -- Mobile top bar -- */}
      <div className="fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-zinc-800/60 bg-zinc-950 dark:bg-zinc-900 px-4 py-3 md:hidden">
        <Link href="/">
          <AqarBrandLogo product="Chaab" size="sm" onDark />
        </Link>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-100">
          {initial}
        </div>
      </div>

      {/* -- Mobile bottom nav -- */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-zinc-800/60 bg-zinc-950 dark:bg-zinc-900 md:hidden">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href as "/"}
            className="flex flex-1 flex-col items-center gap-1 px-1 py-3 text-[10px] text-zinc-500 transition-opacity hover:opacity-80"
          >
            <span className="text-amber-500">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* -- Main content -- */}
      <main className="flex-1 overflow-y-auto pb-20 pt-14 md:pb-0 md:pt-0">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
