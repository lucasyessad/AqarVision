"use client";

import { Link } from "@/lib/i18n/navigation";

interface MarketingFooterProps {
  locale: string;
}

export function MarketingFooter({ locale }: MarketingFooterProps) {
  return (
    <footer style={{ background: "var(--ivoire-warm)", borderTop: "1px solid var(--ivoire-border)" }}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" locale={locale} className="inline-flex items-center gap-1">
              <span
                className="text-xl tracking-tight"
                style={{ fontFamily: "var(--font-display)", color: "var(--onyx)", fontWeight: 600 }}
              >
                Aqar
              </span>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full mx-0.5"
                style={{ background: "var(--or)", marginBottom: "3px" }}
              />
              <span
                className="text-xl tracking-tight"
                style={{ fontFamily: "var(--font-display)", color: "var(--onyx)", fontWeight: 600 }}
              >
                Vision
              </span>
            </Link>
            <p className="mt-3 max-w-[200px] text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Le portail immobilier des 58 wilayas d&apos;Algérie.
            </p>
          </div>

          {/* Recherche */}
          <div>
            <h3
              className="mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--text-dark)" }}
            >
              Recherche
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/search", label: "Acheter" },
                { href: "/search?listing_type=rent", label: "Louer" },
                { href: "/estimer", label: "Estimer" },
                { href: "/comparer", label: "Comparer" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    locale={locale}
                    className="text-sm transition-colors"
                    style={{ color: "var(--text-body)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-dark)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-body)")}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Professionnels */}
          <div>
            <h3
              className="mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--text-dark)" }}
            >
              Professionnels
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/AqarPro/dashboard", label: "Espace Pro" },
                { href: "/agency/new", label: "Créer une agence" },
                { href: "/pricing", label: "Tarifs" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    locale={locale}
                    className="text-sm transition-colors"
                    style={{ color: "var(--text-body)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-dark)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-body)")}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3
              className="mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--text-dark)" }}
            >
              Légal
            </h3>
            <ul className="space-y-2.5">
              {["À propos", "Confidentialité", "CGU", "Contact"].map((label) => (
                <li key={label}>
                  <span className="text-sm" style={{ color: "var(--text-body)" }}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-12 pt-8 text-center text-xs"
          style={{ borderTop: "1px solid var(--ivoire-border)", color: "var(--text-muted)" }}
        >
          &copy; {new Date().getFullYear()} AqarVision — Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
