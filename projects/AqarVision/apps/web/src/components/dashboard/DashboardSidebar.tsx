"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/lib/i18n/navigation";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { AqarBrandLogo } from "@/components/brand/AqarBrandLogo";
import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarCheck,
  BarChart3,
  UserPlus,
  CreditCard,
  MessageSquare,
  Bell,
  Settings,
  GitBranch,
  User,
} from "lucide-react";

const navItems = [
  { key: "overview", href: "/AqarPro/dashboard", icon: LayoutDashboard },
  { key: "listings", href: "/AqarPro/dashboard/listings", icon: Building2 },
  { key: "leads", href: "/AqarPro/dashboard/leads", icon: Users },
  { key: "visits", href: "/AqarPro/dashboard/visit-requests", icon: CalendarCheck },
  { key: "analytics", href: "/AqarPro/dashboard/analytics", icon: BarChart3 },
  { key: "team", href: "/AqarPro/dashboard/team", icon: UserPlus },
  { key: "billing", href: "/AqarPro/dashboard/billing", icon: CreditCard },
  { key: "messages", href: "/AqarPro/dashboard/messaging", icon: MessageSquare },
  { key: "notifications", href: "/AqarPro/dashboard/notifications", icon: Bell },
  { key: "profile", href: "/AqarPro/dashboard/profil", icon: User },
  { key: "settings", href: "/AqarPro/dashboard/settings", icon: Settings },
  { key: "branches", href: "/AqarPro/dashboard/branches", icon: GitBranch },
] as const;

export function DashboardSidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[var(--sidebar-width)] bg-white dark:bg-stone-900 border-e border-stone-200 dark:border-stone-800 h-screen sticky top-0">
      <div className="flex items-center h-16 px-6 border-b border-stone-200 dark:border-stone-800">
        <Link href="/">
          <AqarBrandLogo size="md" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/AqarPro/dashboard" &&
                pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-fast",
                    isActive
                      ? "bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400"
                      : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{t(item.key)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
