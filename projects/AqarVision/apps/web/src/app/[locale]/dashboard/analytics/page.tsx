import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getAgencyStats, getAgencySummary } from "@/features/analytics/services/analytics.service";
import { StatsOverview, StatsChart } from "@/features/analytics/components";

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

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  // Get the user's active agency
  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!membership) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">{t("no_data")}</p>
      </div>
    );
  }

  const agencyId = membership.agency_id as string;

  // Last 30 days range
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const formatDate = (d: Date) => d.toISOString().split("T")[0] ?? "";

  const [summary, dailyStats] = await Promise.all([
    getAgencySummary(supabase, agencyId),
    getAgencyStats(supabase, agencyId, formatDate(thirtyDaysAgo), formatDate(now)),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-night">{t("title")}</h1>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-blue-night">
          {t("overview")}
        </h2>
        <StatsOverview summary={summary} />
      </section>

      <section>
        <StatsChart stats={dailyStats} />
      </section>
    </div>
  );
}
