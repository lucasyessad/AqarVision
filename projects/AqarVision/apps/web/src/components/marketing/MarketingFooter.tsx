"use client";

import { Link } from "@/lib/i18n/navigation";

interface MarketingFooterProps {
  locale: string;
}

export function MarketingFooter({ locale }: MarketingFooterProps) {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" locale={locale} className="inline-flex items-center gap-1">
              <span className="font-display text-xl font-semibold tracking-tight text-zinc-900">
                Aqar
              </span>
              <span className="mx-0.5 mb-0.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="font-display text-xl font-semibold tracking-tight text-zinc-900">
                Vision
              </span>
            </Link>
            <p className="mt-3 max-w-[200px] text-sm leading-relaxed text-zinc-400">
              Le portail immobilier des 58 wilayas d&apos;Algérie.
            </p>
          </div>

          {/* Recherche */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-900">
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
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Professionnels */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-900">
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
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-900">
              Légal
            </h3>
            <ul className="space-y-2.5">
              {["À propos", "Confidentialité", "CGU", "Contact"].map((label) => (
                <li key={label}>
                  <span className="text-sm text-zinc-600">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-200 pt-8 text-center text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} AqarVision — Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
