"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getAgencyUrl } from "@/lib/agency-url";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import { signOutAction } from "@/features/auth/actions/auth.action";
import { AqarBrandLogo } from "@/components/brand/AqarBrandLogo";
import { Tooltip } from "@/components/ui/Tooltip";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

interface DashboardSidebarProps {
  agencySlug: string | null;
  userEmail: string;
  fullName?: string | null;
}

/** Nav items that show a notification badge placeholder */
const BADGE_KEYS = new Set(["leads", "visit_requests"]);

const NAV_ITEMS = [
  {
    key: "overview",
    href: "/AqarPro/dashboard",
    exact: true,
    d: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
  },
  {
    key: "listings",
    href: "/AqarPro/dashboard/listings",
    d: "M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
  },
  {
    key: "leads",
    href: "/AqarPro/dashboard/leads",
    d: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  },
  {
    key: "visit_requests",
    href: "/AqarPro/dashboard/visit-requests",
    d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5",
  },
  {
    key: "analytics",
    href: "/AqarPro/dashboard/analytics",
    d: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  },
  {
    key: "team",
    href: "/AqarPro/dashboard/team",
    d: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
  },
  {
    key: "billing",
    href: "/AqarPro/dashboard/billing",
    d: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
  },
];

const SETTINGS_ITEMS = [
  { key: "settings", href: "/AqarPro/dashboard/settings" },
  { key: "appearance", href: "/AqarPro/dashboard/settings/appearance" },
  { key: "branding", href: "/AqarPro/dashboard/settings/branding" },
  { key: "verification", href: "/AqarPro/dashboard/settings/verification" },
];

export function DashboardSidebar({ agencySlug, userEmail, fullName }: DashboardSidebarProps) {
  const t = useTranslations("dashboard");
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Keyboard shortcut: [ to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "[" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
        setCollapsed((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function isActive(href: string, exact = false): boolean {
    const normalized = pathname.replace(/^\/[a-z]{2}/, "");
    if (exact) return normalized === href || normalized === "";
    return normalized.startsWith(href);
  }

  const initial = (fullName ?? userEmail).charAt(0).toUpperCase();

  return (
    <aside
      className={`flex shrink-0 flex-col border-e border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 transition-all duration-slow ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo + collapse toggle */}
      <div className="flex flex-col gap-2 border-b border-zinc-200 dark:border-zinc-700 px-3 py-4">
        <div className="flex items-center justify-between">
          {!collapsed && <AqarBrandLogo product="Pro" size="sm" onDark={false} />}
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-300"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        </div>
        {!collapsed && (
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400 transition-opacity hover:opacity-70"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t("back_to_portal")}
          </Link>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          const label = t(`nav.${item.key}` as Parameters<typeof t>[0]);
          const hasBadge = BADGE_KEYS.has(item.key);

          const linkContent = (
            <Link
              key={item.key}
              href={item.href as `/${string}`}
              className={[
                "flex items-center rounded-lg border-s-2 transition-all",
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5 text-sm font-medium",
                active
                  ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "border-transparent text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100",
              ].join(" ")}
            >
              {/* Icon wrapper — relative for badge positioning when collapsed */}
              <span className="relative shrink-0">
                <svg
                  className={["h-4 w-4", active ? "text-amber-600 dark:text-amber-400" : "text-zinc-400 dark:text-zinc-500"].join(" ")}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.d} />
                </svg>
                {/* Badge dot on icon — visible only when collapsed */}
                {hasBadge && collapsed && (
                  <span className="absolute -top-0.5 -end-0.5 h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                )}
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1">{label}</span>
                  {/* Badge dot next to label — visible only when expanded */}
                  {hasBadge && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 dark:bg-amber-400" />
                  )}
                </>
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.key} content={label} side="end">
                {linkContent}
              </Tooltip>
            );
          }

          return linkContent;
        })}

        {/* Settings group */}
        {!collapsed && (
          <div className="pt-4">
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              {t("nav.settings")}
            </p>
            {SETTINGS_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href as `/${string}`}
                  className={[
                    "flex items-center rounded-lg border-s-2 px-3 py-2 text-sm transition-all",
                    active
                      ? "border-amber-500 bg-amber-500/10 font-medium text-amber-700 dark:text-amber-400"
                      : "border-transparent text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100",
                  ].join(" ")}
                >
                  {t(`settings_nav.${item.key}` as Parameters<typeof t>[0])}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Voir ma vitrine */}
      {agencySlug && !collapsed && (
        <div className="px-3 pb-3">
          <a
            href={getAgencyUrl(agencySlug)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            {t("view_storefront")}
          </a>
        </div>
      )}

      {/* User footer */}
      <div className={`flex items-center border-t border-zinc-200 dark:border-zinc-700 ${collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"}`}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100 text-xs font-semibold text-zinc-50 dark:text-zinc-900">
          {initial}
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              {fullName && (
                <p className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {fullName}
                </p>
              )}
              <p className="truncate text-[10px] text-zinc-400">{userEmail}</p>
            </div>
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={pathname.split("/")[1] || "fr"} />
              <input type="hidden" name="origin" value={pathname} />
              <button
                type="submit"
                title={t("logout")}
                className="shrink-0 rounded-md p-1 text-zinc-400 transition-opacity hover:opacity-60"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </aside>
  );
}
