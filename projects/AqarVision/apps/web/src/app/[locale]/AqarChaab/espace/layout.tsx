import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import { getCachedUser } from "@/lib/auth/get-cached-user";
import {
  Building2,
  Plus,
  MessageSquare,
  User,
  Bell,
  Heart,
  Clock,
  ArrowUpCircle,
  ChevronLeft,
  Home,
} from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";

const sidebarNav = [
  { key: "myListings", href: "/AqarChaab/espace/mes-annonces", icon: Building2 },
  { key: "deposit", href: "/AqarChaab/espace/deposer", icon: Plus },
  { key: "messages", href: "/AqarChaab/espace/messagerie", icon: MessageSquare },
  { key: "favorites", href: "/AqarChaab/espace/favoris", icon: Heart },
  { key: "alerts", href: "/AqarChaab/espace/alertes", icon: Bell },
  { key: "history", href: "/AqarChaab/espace/historique", icon: Clock },
  { key: "profile", href: "/AqarChaab/espace/profil", icon: User },
  { key: "upgrade", href: "/AqarChaab/espace/upgrade", icon: ArrowUpCircle },
];

export default async function ChaabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCachedUser();
  if (!user) {
    redirect("/auth/login?redirect=/deposer");
  }

  const t = await getTranslations("nav");

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-sticky lg:flex lg:w-60 lg:flex-col lg:border-e lg:border-stone-200 lg:bg-white lg:dark:border-stone-800 lg:dark:bg-stone-900">
        {/* Branding */}
        <div className="flex h-16 items-center px-6 border-b border-stone-200 dark:border-stone-800">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-stone-900 dark:text-stone-50">Aqar</span>
            <span className="text-teal-600 dark:text-teal-400">Vision</span>
          </Link>
        </div>

        {/* Section label */}
        <div className="px-6 pt-4 pb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
            AqarChaab
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {sidebarNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-50 transition-colors duration-fast"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: back to home */}
        <div className="border-t border-stone-200 dark:border-stone-800 p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-300 transition-colors duration-fast"
          >
            <Home className="h-4 w-4" />
            {t("home")}
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:ps-60">
        {/* Top bar */}
        <header className="sticky top-0 z-sticky flex h-14 items-center justify-between border-b border-stone-200 bg-white px-4 dark:border-stone-800 dark:bg-stone-900 lg:h-16 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile: back + branding */}
            <Link
              href="/"
              className="lg:hidden text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <Link href="/" className="lg:hidden text-lg font-bold tracking-tight">
              <span className="text-stone-900 dark:text-stone-50">Aqar</span>
              <span className="text-teal-600 dark:text-teal-400">Vision</span>
            </Link>
            {/* Desktop: section label */}
            <span className="hidden lg:block text-sm font-medium text-stone-500 dark:text-stone-400">
              AqarChaab
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/AqarChaab/espace/notifications"
              className="p-2 rounded-md text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors duration-fast"
            >
              <Bell className="h-5 w-5" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 pb-20 sm:p-6 lg:p-8 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav variant="chaab" />
    </div>
  );
}
