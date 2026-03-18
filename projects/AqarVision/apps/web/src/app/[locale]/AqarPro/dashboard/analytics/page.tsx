import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { TrendingUp, TrendingDown, Eye, Users, MessageSquare, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/auth/get-cached-user";
import { getAgencyForUser } from "@/lib/auth/get-agency-for-user";
import { getAgencyAnalytics, getDailyStats } from "@/features/analytics/services/analytics.service";
import { AnalyticsCharts } from "./analytics-charts";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("analytics") };
}

export default async function AnalyticsPage() {
  const t = await getTranslations("nav");
  const tDash = await getTranslations("dashboard.stats");

  const user = await getCachedUser();
  if (!user) redirect("/auth/login");

  const supabase = await createClient();
  const agencyCtx = await getAgencyForUser(user.id);
  if (!agencyCtx) redirect("/AqarPro/dashboard");

  // Default to last 30 days
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);

  let summary;
  try {
    summary = await getAgencyAnalytics(supabase, agencyCtx.agencyId, from, to);
  } catch {
    summary = {
      totalViews: 0,
      totalLeads: 0,
      totalContacts: 0,
      totalListings: 0,
      viewsTrend: 0,
      leadsTrend: 0,
    };
  }

  let dailyStats: import("@/features/analytics/types/analytics.types").AgencyDailyStats[] = [];
  try {
    dailyStats = await getDailyStats(supabase, agencyCtx.agencyId, from, to);
  } catch {
    // empty
  }

  const statCards = [
    {
      key: "views",
      icon: Eye,
      value: summary.totalViews,
      trend: summary.viewsTrend,
    },
    {
      key: "leads",
      icon: Users,
      value: summary.totalLeads,
      trend: summary.leadsTrend,
    },
    {
      key: "contacts",
      icon: MessageSquare,
      value: summary.totalContacts,
      trend: 0,
    },
    {
      key: "listings",
      icon: Building2,
      value: summary.totalListings,
      trend: 0,
    },
  ] as const;

  // Prepare chart data
  const viewsChartData = dailyStats.map((s) => ({
    date: new Date(s.date).toLocaleDateString("fr", { day: "numeric", month: "short" }),
    value: s.total_views,
  }));

  const leadsChartData = dailyStats.map((s) => ({
    date: new Date(s.date).toLocaleDateString("fr", { day: "numeric", month: "short" }),
    value: s.total_leads,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          {t("analytics")}
        </h1>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.trend >= 0;
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;

          return (
            <div
              key={stat.key}
              className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
                  {tDash(stat.key)}
                </span>
                <Icon className="h-4 w-4 text-stone-400 dark:text-stone-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100">
                {stat.value.toLocaleString("fr-FR")}
              </p>
              {stat.trend !== 0 && (
                <div className="mt-1 flex items-center gap-1 text-xs">
                  <TrendIcon className={`h-3 w-3 ${isPositive ? "text-green-500" : "text-red-500"}`} />
                  <span className={isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                    {isPositive ? "+" : ""}{stat.trend}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <AnalyticsCharts
        viewsData={viewsChartData}
        leadsData={leadsChartData}
      />
    </div>
  );
}
