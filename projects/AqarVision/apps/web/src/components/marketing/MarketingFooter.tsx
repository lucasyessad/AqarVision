import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export function MarketingFooter() {
  const t = useTranslations("nav");

  return (
    <footer className="bg-stone-900 dark:bg-stone-950 text-stone-400 border-t border-stone-800">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block text-2xl font-display font-bold tracking-tight">
              <span className="text-white">Aqar</span>
              <span className="text-teal-400">Vision</span>
            </Link>
            <p className="mt-4 text-sm text-stone-500">
              © {new Date().getFullYear()} AqarVision
            </p>
            <div className="mt-3">
              <ThemeToggle className="text-stone-400 hover:text-stone-200 hover:bg-stone-800" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-200 mb-3">
              {t("search")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/search?type=sale"
                  className="hover:text-stone-200 transition-colors duration-fast"
                >
                  {t("sale")}
                </Link>
              </li>
              <li>
                <Link
                  href="/search?type=rent"
                  className="hover:text-stone-200 transition-colors duration-fast"
                >
                  {t("rent")}
                </Link>
              </li>
              <li>
                <Link
                  href="/agences"
                  className="hover:text-stone-200 transition-colors duration-fast"
                >
                  {t("agencies")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-200 mb-3">
              {t("pro")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/pro"
                  className="hover:text-stone-200 transition-colors duration-fast"
                >
                  AqarPro
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-stone-200 transition-colors duration-fast"
                >
                  {t("pricing")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-200 mb-3">
              {t("deposit")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/deposer"
                  className="hover:text-stone-200 transition-colors duration-fast"
                >
                  {t("deposit")}
                </Link>
              </li>
              <li>
                <Link
                  href="/estimer"
                  className="hover:text-stone-200 transition-colors duration-fast"
                >
                  {t("estimate")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
