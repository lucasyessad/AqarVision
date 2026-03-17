import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";
import { AqarBrandLogo } from "@/components/brand/AqarBrandLogo";
import { signOutAction } from "@/features/auth/actions/auth.action";
import { ChaabSidebarNav } from "./ChaabSidebarNav";
import { ChaabMobileNav } from "./ChaabMobileNav";
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
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">

      {/* -- Sidebar desktop (hidden on mobile, replaced by bottom nav) -- */}
      <aside className="hidden w-60 shrink-0 flex-col border-e border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:flex">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-zinc-100 px-5 py-5 dark:border-zinc-800">
          <AqarBrandLogo product="Chaab" size="sm" onDark={false} />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            <ArrowLeft className="h-3 w-3" />
            {t("nav.back_portal")}
          </Link>
        </div>

        {/* Nav */}
        <ChaabSidebarNav items={navItems} />

        {/* User footer */}
        <div className="border-t border-zinc-100 px-4 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                {displayName}
              </p>
              <p className="truncate text-[10px] text-zinc-500 dark:text-zinc-500">
                {user.email}
              </p>
            </div>
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="origin" value="/AqarChaab/espace" />
              <button
                type="submit"
                title={t("nav.logout")}
                className="shrink-0 rounded-lg p-1 text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* -- Mobile top bar -- */}
      <div className="fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
        <Link href="/">
          <AqarBrandLogo product="Chaab" size="sm" onDark={false} />
        </Link>
        <Link
          href="/AqarChaab/espace/profil"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        >
          {initial}
        </Link>
      </div>

      {/* -- Mobile bottom nav (client component with "Plus" drawer) -- */}
      <ChaabMobileNav />

      {/* -- Main content -- */}
      <main className="flex-1 overflow-y-auto pb-20 pt-14 md:pb-0 md:pt-0">
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
