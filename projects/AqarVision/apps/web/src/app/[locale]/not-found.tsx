import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("common");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 dark:bg-stone-950 px-4">
      <h1 className="text-6xl font-bold text-stone-900 dark:text-stone-100">
        404
      </h1>
      <p className="mt-4 text-lg text-stone-500 dark:text-stone-400">
        {t("errors.notFound")}
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-teal-600 dark:bg-teal-500 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors duration-fast"
      >
        {t("buttons.back")}
      </Link>
    </div>
  );
}
