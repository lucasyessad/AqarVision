import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-blue-night">
        {t("title")}
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            {t("stats.activeListings")}
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-night">0</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            {t("stats.totalLeads")}
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-night">0</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            {t("stats.views")}
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-night">0</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            {t("stats.conversionRate")}
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-night">0%</p>
        </div>
      </div>
    </div>
  );
}
