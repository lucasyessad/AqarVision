import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardStats } from "@/features/analytics/services/analytics.service";
import type { DashboardStats } from "@/features/analytics/types/analytics.types";

function TrendBadge({ value }: { value: number }) {
  if (value === 0) return null;
  const isPositive = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isPositive ? "text-green-600" : "text-red-500"
      }`}
    >
      {isPositive ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );
}

function StatCard({ label, value, trend }: { label: string; value: string; trend?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
      <div className="px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--charcoal-500)" }}>
          {label}
        </p>
        <p className="mt-2 text-3xl font-semibold tabular-nums" style={{ color: "var(--charcoal-950)" }}>
          {value}
        </p>
        {trend !== undefined && (
          <div className="mt-1">
            <TrendBadge value={trend} />
          </div>
        )}
      </div>
    </div>
  );
}

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
    // silently fall back to zeros
  }

  const conversionDisplay =
    stats.conversion_rate > 0 ? `${stats.conversion_rate.toFixed(1)}%` : "0%";

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal-950)" }}>
          {t("title")}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--charcoal-500)" }}>
          Vue d&apos;ensemble de votre activité sur les 30 derniers jours.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
