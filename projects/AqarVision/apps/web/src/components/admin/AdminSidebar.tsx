"use client";

import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { AqarBrandLogo } from "@/components/brand/AqarBrandLogo";
import {
  Building2,
  Users,
  CreditCard,
  ShieldCheck,
  Eye,
  ScrollText,
  Settings,
  Flag,
  User,
} from "lucide-react";

const navItems = [
  { key: "agencies", href: "/admin/agencies", icon: Building2 },
  { key: "users", href: "/admin/users", icon: Users },
  { key: "payments", href: "/admin/payments", icon: CreditCard },
  { key: "verifications", href: "/admin/verifications", icon: ShieldCheck },
  { key: "moderation", href: "/admin/moderation", icon: Eye },
  { key: "auditLogs", href: "/admin/audit-logs", icon: ScrollText },
  { key: "platformSettings", href: "/admin/platform-settings", icon: Settings },
  { key: "entitlements", href: "/admin/entitlements", icon: Flag },
  { key: "profile", href: "/admin/profil", icon: User },
] as const;

export function AdminSidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[var(--sidebar-width)] bg-white dark:bg-stone-900 border-e border-stone-200 dark:border-stone-800 h-screen sticky top-0">
      <div className="flex items-center h-16 px-6 border-b border-stone-200 dark:border-stone-800">
        <Link href="/">
          <AqarBrandLogo size="md" />
        </Link>
        <span className="ms-2 text-xs font-medium text-amber-500 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
          Admin
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
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
