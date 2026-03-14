import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = useTranslations("homepage");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-blue-night">
          {t("title")}
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          {t("subtitle")}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/search"
            className="rounded-lg bg-blue-night px-6 py-3 font-medium text-white transition-colors hover:bg-blue-night/90"
          >
            {t("cta.search")}
          </Link>
          <Link
            href="/auth/login"
            className="rounded-lg border-2 border-gold px-6 py-3 font-medium text-blue-night transition-colors hover:bg-gold/10"
          >
            {t("cta.login")}
          </Link>
        </div>
      </div>
    </main>
  );
}
