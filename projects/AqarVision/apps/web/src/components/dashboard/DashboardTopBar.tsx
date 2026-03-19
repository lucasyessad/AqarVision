"use client";

import { useTranslations } from "next-intl";
import { Bell, Menu, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { AqarBrandLogo } from "@/components/brand/AqarBrandLogo";
import { Link } from "@/lib/i18n/navigation";
import { useState } from "react";

interface DashboardTopBarProps {
  onMenuToggle?: () => void;
}

export function DashboardTopBar({ onMenuToggle }: DashboardTopBarProps) {
  const t = useTranslations("nav");
  const [isDark, setIsDark] = useState(false);

  function handleThemeToggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute(
      "data-theme",
      next ? "dark" : "light"
    );
    document.cookie = `theme=${next ? "dark" : "light"};path=/;max-age=31536000;SameSite=Lax`;
  }

  return (
    <header className="sticky top-0 z-sticky h-16 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-md text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors duration-fast"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="lg:hidden">
          <Link href="/">
            <AqarBrandLogo size="sm" />
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleThemeToggle}
          className="p-2 rounded-md text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors duration-fast"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <Link
          href="/AqarPro/dashboard/notifications"
          className="relative p-2 rounded-md text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors duration-fast"
        >
          <Bell className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
