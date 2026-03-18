"use client";

import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  Plus,
  MessageSquare,
  User,
  LayoutDashboard,
  Users,
  MoreHorizontal,
  Bell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  key: string;
  href: string;
  icon: LucideIcon;
  isCta?: boolean;
}

const chaabItems: NavItem[] = [
  { key: "myListings", href: "/AqarChaab/espace/mes-annonces", icon: Building2 },
  { key: "deposit", href: "/AqarChaab/espace/deposer", icon: Plus, isCta: true },
  { key: "messages", href: "/AqarChaab/espace/messagerie", icon: MessageSquare },
  { key: "profile", href: "/AqarChaab/espace/profil", icon: User },
];

const proItems: NavItem[] = [
  { key: "dashboard", href: "/AqarPro/dashboard", icon: LayoutDashboard },
  { key: "listings", href: "/AqarPro/dashboard/listings", icon: Building2 },
  { key: "leads", href: "/AqarPro/dashboard/leads", icon: Users },
  { key: "messages", href: "/AqarPro/dashboard/messaging", icon: MessageSquare },
  { key: "more", href: "#", icon: MoreHorizontal },
];

interface BottomNavProps {
  variant: "chaab" | "pro";
}

export function BottomNav({ variant }: BottomNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const items = variant === "chaab" ? chaabItems : proItems;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-sticky bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 md:hidden">
      <ul className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.isCta) {
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-5 w-14 h-14 rounded-full bg-amber-400 text-stone-950 shadow-lg"
                >
                  <Icon className="h-6 w-6" />
                </Link>
              </li>
            );
          }

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1",
                  isActive
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-stone-500 dark:text-stone-400"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-2xs">{t(item.key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
