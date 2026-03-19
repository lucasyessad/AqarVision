"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { AqarBrandLogo } from "@/components/brand/AqarBrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";

const navLinks = [
  { key: "search", href: "/search" },
  { key: "pro", href: "/pro" },
  { key: "chaab", href: "/chaab" },
  { key: "agencies", href: "/agences" },
  { key: "estimate", href: "/estimer" },
] as const;

export function FloatingNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── Desktop pill nav ── */}
      <div
        className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-sticky hidden md:flex",
          "items-center gap-1 rounded-2xl border border-stone-800",
          "transition-all duration-normal",
          scrolled
            ? "bg-stone-950/95 backdrop-blur-xl shadow-lg px-4 py-2"
            : "bg-stone-950/75 backdrop-blur-md px-5 py-2.5"
        )}
      >
        <Link href="/" className="me-4 flex-shrink-0">
          <AqarBrandLogo size="sm" />
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-fast",
                pathname === link.href
                  ? "text-brand bg-brand-900/30"
                  : "text-stone-400 hover:text-stone-100 hover:bg-stone-800/60"
              )}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="ms-3 flex items-center gap-1 border-s border-stone-800 ps-3">
          <LanguageSwitcher currentLocale={locale} />
          <ThemeToggle />
          <Link
            href="/auth/login"
            className={cn(
              "ms-1 inline-flex items-center justify-center px-4 py-1.5",
              "text-sm font-semibold rounded-lg",
              "bg-brand text-stone-950 hover:bg-brand-600",
              "transition-colors duration-fast"
            )}
          >
            {t("login")}
          </Link>
        </div>
      </div>

      {/* ── Mobile bar ── */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-sticky md:hidden",
          "flex items-center justify-between h-14 px-4",
          "border-b border-stone-800 transition-all duration-normal",
          scrolled
            ? "bg-stone-950/95 backdrop-blur-xl"
            : "bg-stone-950/80 backdrop-blur-md"
        )}
      >
        <Link href="/">
          <AqarBrandLogo size="sm" />
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-stone-400 hover:bg-stone-800 hover:text-stone-100"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="fixed top-14 left-0 right-0 z-sticky md:hidden bg-stone-950 border-b border-stone-800 animate-slide-down">
          <nav className="flex flex-col gap-1 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-3 py-2.5 rounded-lg text-sm font-medium",
                  pathname === link.href
                    ? "bg-brand-900/40 text-brand"
                    : "text-stone-400 hover:text-stone-100 hover:bg-stone-800"
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
          <div className="border-t border-stone-800 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <LanguageSwitcher currentLocale={locale} />
              <ThemeToggle />
            </div>
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-brand text-stone-950 hover:bg-brand-600 transition-colors duration-fast"
            >
              {t("login")}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
