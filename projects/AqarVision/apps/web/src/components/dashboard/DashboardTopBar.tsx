"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IconButton } from "@/components/ui/IconButton";
import { Search, Bell, Command, ChevronRight } from "lucide-react";

/** Map URL path segments to dashboard.nav translation keys. */
const SEGMENT_TO_NAV_KEY: Record<string, string> = {
  listings: "listings",
  leads: "leads",
  "visit-requests": "visit_requests",
  analytics: "analytics",
  settings: "settings",
  team: "team",
  billing: "billing",
};

interface DashboardTopBarProps {
  title: string;
  onCommandPaletteOpen: () => void;
  notificationCount?: number;
}

export function DashboardTopBar({
  title,
  onCommandPaletteOpen,
  notificationCount = 0,
}: DashboardTopBarProps) {
  const t = useTranslations("dashboard");
  const pathname = usePathname();

  /** Build breadcrumb segments from the current pathname. */
  const breadcrumbs = useMemo(() => {
    // Strip locale prefix (e.g. /fr, /ar)
    const normalized = pathname.replace(/^\/[a-z]{2}/, "");
    // Split after /AqarPro/dashboard/
    const afterDashboard = normalized
      .replace(/^\/AqarPro\/dashboard\/?/, "")
      .split("/")
      .filter(Boolean);

    const crumbs: { label: string; isLast: boolean }[] = [
      { label: t("nav.overview"), isLast: afterDashboard.length === 0 },
    ];

    if (afterDashboard.length > 0) {
      const segment = afterDashboard[0] ?? "";
      const navKey = SEGMENT_TO_NAV_KEY[segment] as string | undefined;
      const label: string = navKey
        ? t(`nav.${navKey}` as Parameters<typeof t>[0])
        : segment;
      crumbs.push({ label, isLast: true });
    }

    return crumbs;
  }, [pathname, t]);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border-default bg-surface px-6 backdrop-blur-sm">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-tertiary rtl:rotate-180" />
            )}
            <span
              className={
                crumb.isLast
                  ? "font-semibold text-primary"
                  : "text-tertiary"
              }
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Command palette trigger */}
        <button
          type="button"
          onClick={onCommandPaletteOpen}
          className="flex items-center gap-2 rounded-lg border border-border-default bg-muted px-3 py-1.5 text-xs text-secondary transition-colors hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-primary"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("nav.overview")}...</span>
          <kbd className="hidden items-center gap-0.5 rounded border border-border-default bg-surface px-1.5 py-0.5 font-mono text-[10px] text-tertiary sm:inline-flex">
            <Command className="h-2.5 w-2.5" />
            K
          </kbd>
        </button>

        {/* Notifications */}
        <IconButton
          aria-label="Notifications"
          size="sm"
          variant="ghost"
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {notificationCount > 0 ? (
            <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 dark:bg-amber-400 px-1 text-[10px] font-bold text-white dark:text-zinc-950">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          ) : (
            <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 ring-2 ring-surface" />
          )}
        </IconButton>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
