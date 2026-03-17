"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import {
  FileText,
  MessageCircle,
  Bell,
  MoreHorizontal,
  FolderOpen,
  Clock,
  User,
  Banknote,
  X,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function ChaabMobileNav() {
  const t = useTranslations("espace");
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    },
    [],
  );

  useEffect(() => {
    if (drawerOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, handleKeyDown]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/AqarChaab/espace/mes-annonces") {
      return pathname.includes("/mes-annonces");
    }
    return pathname.includes(href);
  };

  const bottomNavItems: NavItem[] = [
    {
      href: "/AqarChaab/espace/mes-annonces",
      label: t("nav.annonces"),
      icon: <FileText className="h-5 w-5" />,
    },
    {
      href: "/AqarChaab/espace/messagerie",
      label: t("nav.messagerie"),
      icon: <MessageCircle className="h-5 w-5" />,
    },
    {
      href: "/AqarChaab/espace/alertes",
      label: t("nav.alertes"),
      icon: <Bell className="h-5 w-5" />,
    },
  ];

  const drawerItems: NavItem[] = [
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
      href: "/AqarChaab/espace/profil",
      label: t("nav.profil"),
      icon: <User className="h-5 w-5" />,
    },
    {
      href: "/AqarChaab/espace/upgrade",
      label: t("nav.upgrade"),
      icon: <Banknote className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Bottom navigation bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
        {bottomNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href as "/"}
              className={[
                "flex flex-1 flex-col items-center gap-1 px-1 py-3 text-[10px] transition-colors",
                active
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-zinc-500 dark:text-zinc-400",
              ].join(" ")}
            >
              <span className={active ? "text-amber-500" : ""}>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        {/* Plus button */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className={[
            "flex flex-1 flex-col items-center gap-1 px-1 py-3 text-[10px] transition-colors",
            drawerOpen
              ? "text-amber-600 dark:text-amber-400"
              : "text-zinc-500 dark:text-zinc-400",
          ].join(" ")}
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="truncate">{t("nav.plus")}</span>
        </button>
      </nav>

      {/* Drawer overlay + panel */}
      {drawerOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel — slides up from bottom */}
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 animate-drawer-up">
            {/* Drawer handle */}
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t("nav.plus")}
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer nav items */}
            <nav className="space-y-1 px-3 pb-6 pt-2">
              {drawerItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href as "/"}
                    className={[
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                        : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "shrink-0",
                        active ? "text-amber-500" : "text-zinc-400 dark:text-zinc-500",
                      ].join(" ")}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                    {active && (
                      <span className="ms-auto h-1.5 w-1.5 rounded-full bg-amber-500" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
