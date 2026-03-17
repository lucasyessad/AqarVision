"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { AqarBrandLogo } from "@/components/brand/AqarBrandLogo";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

interface MarketingFooterProps {
  locale: string;
}

export function MarketingFooter({ locale }: MarketingFooterProps) {
  const t = useTranslations("marketing_footer");

  const searchLinks = [
    { href: "/search", label: t("buy") },
    { href: "/search?listing_type=rent", label: t("rent_link") },
    { href: "/estimer", label: t("estimate") },
    { href: "/comparer", label: t("compare") },
    { href: "/agences", label: t("agencies") },
  ];

  const proLinks = [
    { href: "/AqarPro/dashboard", label: t("pro_space") },
    { href: "/agency/new", label: t("create_agency") },
    { href: "/pricing", label: t("pricing") },
  ];

  const chaabLinks = [
    { href: "/AqarChaab/auth/login", label: t("chaab_space") },
    { href: "/deposer", label: t("deposit") },
  ];

  const legalLinks = [
    { label: t("about") },
    { label: t("privacy") },
    { label: t("terms") },
    { label: t("contact") },
  ];

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-950">
      {/* Tricolore accent strip */}
      <div className="flex h-0.5">
        <div className="flex-1 bg-atlas" />
        <div className="flex-1 bg-surface-muted" />
        <div className="flex-1 bg-sahara" />
      </div>

      <div className="mx-auto max-w-container px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-5">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" locale={locale}>
              <AqarBrandLogo product="Vision" size="md" onDark />
            </Link>
            <p className="mt-4 max-w-[220px] text-sm leading-relaxed text-zinc-400">
              {t("tagline")}
            </p>
            <div className="mt-5">
              <LanguageSwitcher currentLocale={locale} />
            </div>
          </div>

          {/* Recherche */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              {t("search_heading")}
            </h3>
            <ul className="space-y-2.5">
              {searchLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    locale={locale}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Professionnels */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              {t("pro_heading")}
            </h3>
            <ul className="space-y-2.5">
              {proLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    locale={locale}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Particuliers */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              {t("chaab_heading")}
            </h3>
            <ul className="space-y-2.5">
              {chaabLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    locale={locale}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              {t("legal_heading")}
            </h3>
            <ul className="space-y-2.5">
              {legalLinks.map(({ label }) => (
                <li key={label}>
                  <span className="text-sm text-zinc-500 cursor-default">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-zinc-800 pt-8 sm:flex-row sm:justify-between">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} AqarVision — {t("rights")}
          </p>
          <div className="flex items-center gap-1">
            <span className="text-xs text-zinc-600">{t("made_in")}</span>
            <span className="text-xs">🇩🇿</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
