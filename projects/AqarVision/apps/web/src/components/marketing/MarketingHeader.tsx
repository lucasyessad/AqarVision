"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/lib/i18n/navigation";
import { usePathname } from "next/navigation";
import { AqarBrandLogo } from "@/components/brand/AqarBrandLogo";
import { signOutAction } from "@/features/auth/actions/auth.action";

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
  const [scrolled, setScrolled] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
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
    { href: "/search?listing_type=sale", label: "Acheter" },
    { href: "/search?listing_type=rent", label: "Louer" },
    { href: "/vendre", label: "Vendre" },
    { href: "/agences", label: "Trouver un agent" },
  ];

  const textColor = transparent ? "rgba(253,251,247,0.80)" : "var(--text-body)";
  const textHover = transparent ? "var(--ivoire)" : "var(--text-dark)";

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: transparent ? "transparent" : "rgba(253, 251, 247, 0.97)",
        backdropFilter: transparent ? "none" : "blur(20px)",
        borderBottom: transparent
          ? "1px solid transparent"
          : "1px solid var(--ivoire-border)",
        boxShadow: transparent ? "none" : "var(--shadow-sm)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" locale={locale} className="flex flex-col items-start shrink-0">
          <AqarBrandLogo product="Vision" size="md" onDark={transparent} />
          {isSearch && (
            <span
              className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: transparent ? "rgba(253,251,247,0.4)" : "var(--text-faint)" }}
            >
              Search
            </span>
          )}
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              locale={locale}
              className="text-sm font-medium transition-colors"
              style={{ color: textColor }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = textHover; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = textColor; }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right CTA area */}
        <div className="flex items-center gap-2">

          {user ? (
            /* ── Logged in: avatar + dropdown ── */
            <div ref={avatarRef} className="relative">
              <button
                type="button"
                onClick={() => setAvatarOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
                aria-label="Mon espace"
              >
                {/* Avatar circle */}
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
                  style={{
                    background: user.profileType === "pro" ? "#1a365d" : "var(--onyx)",
                    color: "var(--ivoire)",
                  }}
                >
                  {user.initial}
                </div>
                {/* Name + profile type badge */}
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span
                    className="text-sm font-medium truncate max-w-[110px]"
                    style={{ color: transparent ? "rgba(253,251,247,0.9)" : "var(--text-dark)" }}
                  >
                    {user.name}
                  </span>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide"
                    style={{
                      color: user.profileType === "pro"
                        ? (transparent ? "rgba(212,175,55,0.8)" : "#1a365d")
                        : (transparent ? "rgba(253,251,247,0.4)" : "var(--text-faint)"),
                    }}
                  >
                    {user.profileType === "pro" ? "Pro" : "Particulier"}
                  </span>
                </div>
                <svg
                  className="h-3 w-3 shrink-0 transition-transform"
                  style={{
                    transform: avatarOpen ? "rotate(180deg)" : "rotate(0deg)",
                    color: transparent ? "rgba(253,251,247,0.5)" : "var(--text-faint)",
                  }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Avatar dropdown */}
              {avatarOpen && (
                <div
                  className="absolute end-0 top-full mt-2 w-52 overflow-hidden rounded-xl shadow-xl"
                  style={{
                    background: "#fff",
                    border: "1px solid var(--ivoire-border)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  }}
                >
                  {/* Profile info */}
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--ivoire-border)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
                      {user.profileType === "pro" ? "Espace Professionnel" : "Espace Particulier"}
                    </p>
                    <p className="mt-0.5 text-sm font-medium truncate" style={{ color: "var(--onyx)" }}>
                      {user.name}
                    </p>
                  </div>

                  {/* Go to espace */}
                  <Link
                    href={user.espaceHref as "/"}
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors hover:bg-[#fafaf9]"
                    style={{ color: "var(--text-body)" }}
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
                    </svg>
                    Mon espace
                  </Link>

                  {/* Sign out */}
                  <div style={{ borderTop: "1px solid var(--ivoire-border)" }}>
                    <form action={signOutAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="origin" value={user.espaceHref} />
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2.5 px-4 py-3 text-sm transition-colors hover:bg-[#fafaf9]"
                        style={{ color: "var(--text-faint)" }}
                      >
                        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        Se déconnecter
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>

          ) : (
            /* ── Logged out: two separate buttons ── */
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/AqarChaab/auth/login"
                locale={locale}
                className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all"
                style={{
                  color: transparent ? "rgba(253,251,247,0.85)" : "var(--text-body)",
                  border: transparent ? "1px solid rgba(253,251,247,0.2)" : "1px solid var(--ivoire-border)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = transparent ? "var(--ivoire)" : "var(--text-dark)";
                  el.style.background = transparent ? "rgba(253,251,247,0.08)" : "var(--ivoire)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = transparent ? "rgba(253,251,247,0.85)" : "var(--text-body)";
                  el.style.background = "transparent";
                }}
              >
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Particulier
              </Link>

              <Link
                href="/AqarPro/auth/login"
                locale={locale}
                className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all"
                style={{
                  color: transparent ? "var(--ivoire)" : "#1a365d",
                  background: transparent ? "rgba(253,251,247,0.12)" : "rgba(26,54,93,0.06)",
                  border: transparent ? "1px solid rgba(253,251,247,0.25)" : "1px solid rgba(26,54,93,0.15)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = transparent ? "rgba(253,251,247,0.2)" : "rgba(26,54,93,0.12)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = transparent ? "rgba(253,251,247,0.12)" : "rgba(26,54,93,0.06)";
                }}
              >
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
                Pro
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
