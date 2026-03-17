"use client";

import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Search, Bell } from "lucide-react";

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

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6">
      {/* Page title */}
      <h1 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
        {title}
      </h1>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Command palette trigger */}
        <button
          type="button"
          onClick={onCommandPaletteOpen}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 transition-colors hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("nav.overview")}...</span>
          <kbd className="hidden rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 sm:inline">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </button>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
