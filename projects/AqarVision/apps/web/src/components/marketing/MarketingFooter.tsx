import { Link } from "@/lib/i18n/navigation";

interface MarketingFooterProps {
  locale: string;
}

export function MarketingFooter({ locale }: MarketingFooterProps) {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link href="/" locale={locale} className="inline-block">
              <span className="text-xl font-bold text-blue-night">
                Aqar<span className="text-gold">Vision</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              Conçu pour les 58 wilayas d&apos;Algérie
            </p>
          </div>

          {/* Colonne 1 — AqarSearch */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-night">
              AqarSearch
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/search"
                  locale={locale}
                  className="text-sm text-gray-500 transition-colors hover:text-blue-night"
                >
                  Rechercher
                </Link>
              </li>
              <li>
                <Link
                  href="/favorites"
                  locale={locale}
                  className="text-sm text-gray-500 transition-colors hover:text-blue-night"
                >
                  Favoris
                </Link>
              </li>
              <li>
                <Link
                  href="/favorites"
                  locale={locale}
                  className="text-sm text-gray-500 transition-colors hover:text-blue-night"
                >
                  Alertes
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 2 — AqarPro */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-night">
              AqarPro
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  locale={locale}
                  className="text-sm text-gray-500 transition-colors hover:text-blue-night"
                >
                  Espace Pro
                </Link>
              </li>
              <li>
                <Link
                  href="/agency/new"
                  locale={locale}
                  className="text-sm text-gray-500 transition-colors hover:text-blue-night"
                >
                  Créer une agence
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  locale={locale}
                  className="text-sm text-gray-500 transition-colors hover:text-blue-night"
                >
                  Tarifs
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 — Corporate */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-night">
              Corporate
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/pro"
                  locale={locale}
                  className="text-sm text-gray-500 transition-colors hover:text-blue-night"
                >
                  À propos
                </Link>
              </li>
              <li>
                <span className="text-sm text-gray-400">Confidentialité</span>
              </li>
              <li>
                <span className="text-sm text-gray-400">CGU</span>
              </li>
              <li>
                <span className="text-sm text-gray-400">Contact</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} AqarVision. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
