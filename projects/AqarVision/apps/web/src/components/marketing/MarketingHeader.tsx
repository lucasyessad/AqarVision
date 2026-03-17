"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { usePathname } from "next/navigation";
import { AqarBrandLogo } from "@/components/brand/AqarBrandLogo";
import { signOutAction } from "@/features/auth/actions/auth.action";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChevronDown, User, Building2, Home, LogOut, Menu, X } from "lucide-react";

interface HeaderUser {
  name: string;
  initial: string;
  profileType: "pro" | "chaab";
  espaceHref: string;
}

interface MarketingHeaderProps {
  locale: string;
  user: HeaderUser | null;
}

export function MarketingHeader({ locale, user }: MarketingHeaderProps) {
  const pathname = usePathname();
  const t = useTranslations("marketing_header");
  const [scrolled, setScrolled] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  const isHomepage = pathname === `/${locale}` || pathname === "/";
  const isSearch = pathname.includes("/search");

  useEffect(() => {
    if (!isHomepage) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomepage]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const transparent = isHomepage && !scrolled;

  const navLinks = [
    { href: "/search?listing_type=sale", label: t("buy") },
    { href: "/search?listing_type=rent", label: t("rent") },
    { href: "/agences", label: t("agencies") },
    { href: "/estimer", label: t("estimate") },
  ];

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-all duration-300",
        transparent
          ? "bg-transparent"
          : "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-700 dark:border-zinc-800 shadow-xs",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" locale={locale} className="flex shrink-0 flex-col items-start">
          <AqarBrandLogo product="Vision" size="md" onDark={transparent} />
          {isSearch && (
            <span
              className={[
                "mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em]",
                transparent ? "text-zinc-50/40" : "text-zinc-400 dark:text-zinc-500",
              ].join(" ")}
            >
              Search
            </span>
          )}
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname.includes(href.split("?")[0] ?? href);
            return (
              <Link
                key={href}
                href={href}
                locale={locale}
                className={[
                  "text-sm transition-colors",
                  transparent
                    ? isActive
                      ? "font-medium text-zinc-50"
                      : "text-zinc-50/80 hover:text-zinc-50"
                    : isActive
                      ? "font-medium text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300",
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA area */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            /* ── Logged in: avatar + dropdown ── */
            <div ref={avatarRef} className="relative">
              <button
                type="button"
                onClick={() => setAvatarOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
                aria-label={t("my_space")}
              >
                {/* Avatar circle */}
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-zinc-50",
                    user.profileType === "pro"
                      ? "bg-zinc-900 dark:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-900 dark:text-zinc-100"
                      : "bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-800 dark:text-zinc-200",
                  ].join(" ")}
                >
                  {user.initial}
                </div>
                {/* Name + profile type badge */}
                <div className="hidden flex-col items-start leading-tight sm:flex">
                  <span
                    className={[
                      "max-w-[110px] truncate text-sm font-medium",
                      transparent ? "text-zinc-50/90" : "text-zinc-800 dark:text-zinc-200",
                    ].join(" ")}
                  >
                    {user.name}
                  </span>
                  <span
                    className={[
                      "text-[10px] font-semibold uppercase tracking-wide",
                      user.profileType === "pro"
                        ? transparent ? "text-amber-400/80" : "text-amber-700 dark:text-amber-400"
                        : transparent ? "text-zinc-50/40" : "text-zinc-400 dark:text-zinc-500",
                    ].join(" ")}
                  >
                    {user.profileType === "pro" ? "Pro" : t("individual")}
                  </span>
                </div>
                <ChevronDown
                  className={[
                    "h-3 w-3 shrink-0 transition-transform",
                    avatarOpen ? "rotate-180" : "rotate-0",
                    transparent ? "text-zinc-50/50" : "text-zinc-400 dark:text-zinc-500",
                  ].join(" ")}
                />
              </button>

              {/* Avatar dropdown */}
              {avatarOpen && (
                <div className="absolute end-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl">
                  {/* Profile info */}
                  <div className="border-b border-zinc-100 dark:border-zinc-800 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                      {user.profileType === "pro" ? t("pro_space") : t("individual_space")}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {user.name}
                    </p>
                  </div>

                  {/* Go to espace */}
                  <Link
                    href={user.espaceHref as "/"}
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-800"
                  >
                    <Home className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                    {t("my_space")}
                  </Link>

                  {/* Sign out */}
                  <div className="border-t border-zinc-100 dark:border-zinc-800">
                    <form action={signOutAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="origin" value={user.espaceHref} />
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-zinc-400 dark:text-zinc-500 transition-colors hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-800"
                      >
                        <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                        {t("logout")}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>

          ) : (
            /* ── Logged out: two separate buttons ── */
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/AqarChaab/auth/login"
                locale={locale}
                className={[
                  "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all",
                  transparent
                    ? "border border-zinc-50/20 text-zinc-50/85 hover:border-zinc-50/40 hover:bg-zinc-50/8 hover:text-zinc-50"
                    : "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:text-zinc-100 dark:hover:text-zinc-100",
                ].join(" ")}
              >
                <User className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                {t("individual")}
              </Link>

              <Link
                href="/AqarPro/auth/login"
                locale={locale}
                className={[
                  "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all",
                  transparent
                    ? "border border-zinc-50/25 bg-zinc-50/12 text-zinc-50 hover:bg-zinc-50/20"
                    : "border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                ].join(" ")}
              >
                <Building2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                Pro
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className={`lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
              transparent ? "text-zinc-50 hover:bg-zinc-50/10" : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
            aria-label={mobileOpen ? t("close_menu") : t("open_menu")}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 animate-slide-down">
          <nav className="flex flex-col px-4 py-3">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                locale={locale}
                onClick={() => setMobileOpen(false)}
                className="py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
              >
                {label}
              </Link>
            ))}
          </nav>
          {!user && (
            <div className="flex gap-2 border-t border-zinc-100 dark:border-zinc-800 px-4 py-4">
              <Link
                href="/AqarChaab/auth/login"
                locale={locale}
                onClick={() => setMobileOpen(false)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300"
              >
                <User className="h-3.5 w-3.5" strokeWidth={1.5} />
                {t("individual")}
              </Link>
              <Link
                href="/AqarPro/auth/login"
                locale={locale}
                onClick={() => setMobileOpen(false)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-3 py-2.5 text-sm font-semibold text-white dark:text-zinc-900"
              >
                <Building2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                Pro
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
