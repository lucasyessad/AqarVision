import { Link } from "@/lib/i18n/navigation";

interface MarketingHeaderProps {
  locale: string;
}

export function MarketingHeader({ locale }: MarketingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" locale={locale} className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-night">
            Aqar<span className="text-gold">Vision</span>
          </span>
        </Link>

        {/* Nav principale */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/search"
            locale={locale}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-night"
          >
            Rechercher
          </Link>
          <Link
            href="/pricing"
            locale={locale}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-night"
          >
            Tarifs
          </Link>
          <Link
            href="/pro"
            locale={locale}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-night"
          >
            Espace Pro
          </Link>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/favorites"
            locale={locale}
            className="hidden text-sm font-medium text-blue-night transition-colors hover:text-blue-night/80 sm:inline-flex"
          >
            Espace Visiteur
          </Link>
          <Link
            href="/dashboard"
            locale={locale}
            className="inline-flex items-center rounded-lg bg-blue-night px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-night/90"
          >
            Espace Pro
          </Link>
        </div>
      </div>
    </header>
  );
}
