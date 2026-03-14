import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardStats } from "@/features/analytics/services/analytics.service";
import type { DashboardStats } from "@/features/analytics/types/analytics.types";

/* ------------------------------------------------------------------ */
/*  Trend badge                                                         */
/* ------------------------------------------------------------------ */

function TrendBadge({ value }: { value: number }) {
  if (value === 0) return null;
  const isPositive = value > 0;
  return (
    <span
      className={`mt-1 inline-flex items-center gap-0.5 text-xs font-medium ${
        isPositive ? "text-green-600" : "text-red-500"
      }`}
    >
      {isPositive ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat card                                                           */
/* ------------------------------------------------------------------ */

interface StatCardProps {
  label: string;
  value: string;
  trend?: number;
}

function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-blue-night">{value}</p>
      {trend !== undefined && <TrendBadge value={trend} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id, role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!membership) {
    redirect(`/${locale}/agency/new`);
  }

  let stats: DashboardStats = {
    active_listings: 0,
    leads_this_month: 0,
    views_30d: 0,
    conversion_rate: 0,
    trend_views: 0,
    trend_leads: 0,
    trend_listings: 0,
    trend_conversion: 0,
  };

  try {
    stats = await getDashboardStats(supabase, membership.agency_id);
  } catch {
    // En cas d'erreur, on affiche les zéros sans bloquer la page
  }

  const conversionDisplay =
    stats.conversion_rate > 0
      ? `${stats.conversion_rate.toFixed(1)}%`
      : "0%";

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-blue-night">
        {t("title")}
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("stats.activeListings")}
          value={String(stats.active_listings)}
          trend={stats.trend_listings !== 0 ? stats.trend_listings : undefined}
        />
        <StatCard
          label={t("stats.totalLeads")}
          value={String(stats.leads_this_month)}
          trend={stats.trend_leads !== 0 ? stats.trend_leads : undefined}
        />
        <StatCard
          label={t("stats.views")}
          value={new Intl.NumberFormat(locale).format(stats.views_30d)}
          trend={stats.trend_views !== 0 ? stats.trend_views : undefined}
        />
        <StatCard
          label={t("stats.conversionRate")}
          value={conversionDisplay}
          trend={stats.trend_conversion !== 0 ? stats.trend_conversion : undefined}
        />
      </div>
    </div>
  );
}
