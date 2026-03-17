import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardStats } from "@/features/analytics/services/analytics.service";
import type { DashboardStats } from "@/features/analytics/types/analytics.types";
import { Link } from "@/lib/i18n/navigation";
import { FileText, Users, BarChart3, AlertCircle, Clock } from "lucide-react";

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
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
        {value}
      </p>
      {trend !== undefined && (
        <div className="mt-1">
          <TrendBadge value={trend} />
        </div>
      )}
    </div>
  );
}

function ActionRequiredCard({
  icon,
  label,
  href,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href as `/${string}`}
      className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</p>
    </Link>
  );
}

function QuickActionButton({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href as `/${string}`}
      className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 text-center transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
        {icon}
      </div>
      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
    </Link>
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
    redirect(`/${locale}/AqarPro/auth/login`);
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

  // Fetch action-required data in parallel
  const [{ count: unansweredLeads }, { count: expiringListings }] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", membership.agency_id)
      .eq("status", "new"),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", membership.agency_id)
      .eq("status", "published")
      .lt("updated_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const conversionDisplay =
    stats.conversion_rate > 0 ? `${stats.conversion_rate.toFixed(1)}%` : "0%";

  const actionItems: { icon: React.ReactNode; label: string; href: string; color: string }[] = [];

  if ((unansweredLeads ?? 0) > 0) {
    actionItems.push({
      icon: <AlertCircle className="h-4 w-4 text-amber-600" />,
      label: t("unanswered_leads", { count: unansweredLeads ?? 0 }),
      href: "/AqarPro/dashboard/leads",
      color: "bg-amber-100 dark:bg-amber-900/30",
    });
  }

  if ((expiringListings ?? 0) > 0) {
    actionItems.push({
      icon: <Clock className="h-4 w-4 text-red-600" />,
      label: t("expiring_listings", { count: expiringListings ?? 0 }),
      href: "/AqarPro/dashboard/listings",
      color: "bg-red-100 dark:bg-red-900/30",
    });
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t("overview_subtitle")}
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

      {/* Two-column layout: Actions + Quick actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Action required */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            {t("section_action_required")}
          </h2>
          {actionItems.length > 0 ? (
            <div className="space-y-2">
              {actionItems.map((item, i) => (
                <ActionRequiredCard key={i} {...item} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
              <p className="text-sm text-zinc-400">{t("no_actions_required")}</p>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            {t("quick_actions")}
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <QuickActionButton
              icon={<FileText className="h-4 w-4" />}
              label={t("new_listing")}
              href="/AqarPro/dashboard/listings/new"
            />
            <QuickActionButton
              icon={<Users className="h-4 w-4" />}
              label={t("invite_member")}
              href="/AqarPro/dashboard/team"
            />
            <QuickActionButton
              icon={<BarChart3 className="h-4 w-4" />}
              label={t("view_analytics")}
              href="/AqarPro/dashboard/analytics"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
