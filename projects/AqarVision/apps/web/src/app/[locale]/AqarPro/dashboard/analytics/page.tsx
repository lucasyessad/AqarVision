import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getAgencyStats, getAgencySummary } from "@/features/analytics/services/analytics.service";
import { getAdvancedAnalytics } from "@/features/analytics/services/advanced-analytics.service";
import { StatsOverview, StatsChart, AdvancedAnalytics } from "@/features/analytics/components";

export default async function AnalyticsDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("analytics");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/AqarPro/auth/login`);

  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!membership) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("no_data")}</p>
      </div>
    );
  }

  const agencyId = membership.agency_id as string;

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const formatDate = (d: Date) => d.toISOString().split("T")[0] ?? "";

  const [summary, dailyStats, advancedData] = await Promise.all([
    getAgencySummary(supabase, agencyId),
    getAgencyStats(supabase, agencyId, formatDate(thirtyDaysAgo), formatDate(now)),
    getAdvancedAnalytics(supabase, agencyId),
  ]);

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Performances de votre agence sur les 30 derniers jours.
        </p>
      </div>

      {/* Overview section */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            {t("overview")}
          </h2>
        </div>
        <div className="p-6">
          <StatsOverview summary={summary} />
        </div>
      </div>

      {/* Chart section */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            Évolution quotidienne
          </h2>
        </div>
        <div className="p-6">
          <StatsChart stats={dailyStats} />
        </div>
      </div>

      {/* Advanced analytics section */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            Analyses avancées
          </h2>
        </div>
        <div className="p-6">
          <AdvancedAnalytics data={advancedData} />
        </div>
      </div>
    </div>
  );
}
