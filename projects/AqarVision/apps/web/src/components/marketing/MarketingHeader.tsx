"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { AqarBrandLogo } from "@/components/brand/AqarBrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";

const navLinks = [
  { key: "search", href: "/search" },
  { key: "deposit", href: "/deposer" },
  { key: "pro", href: "/pro" },
  { key: "pricing", href: "/pricing" },
  { key: "agencies", href: "/agences" },
  { key: "estimate", href: "/estimer" },
] as const;

export function MarketingHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-sticky bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <AqarBrandLogo size="md" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-fast",
                  pathname === link.href
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-1">
            <LanguageSwitcher currentLocale={locale} />
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="ms-2 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-teal-600 dark:bg-teal-500 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors duration-fast"
            >
              {t("login")}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-stone-200 dark:border-stone-800 py-4 animate-slide-down">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium",
                    pathname === link.href
                      ? "bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400"
                      : "text-stone-600 dark:text-stone-400"
                  )}
                >
                  {t(link.key)}
                </Link>
              ))}
              <div className="border-t border-stone-200 dark:border-stone-800 mt-2 pt-2 flex flex-col gap-2">
                <div className="flex items-center justify-between px-3">
                  <LanguageSwitcher currentLocale={locale} />
                  <ThemeToggle />
                </div>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="mx-3 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-teal-600 dark:bg-teal-500 rounded-md"
                >
                  {t("login")}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
