import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardStats } from "@/features/analytics/services/analytics.service";
import type { DashboardStats } from "@/features/analytics/types/analytics.types";
import { Link } from "@/lib/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  FileText,
  Users,
  Eye,
  TrendingUp,
  AlertCircle,
  Clock,
  BarChart3,
  ExternalLink,
  Rocket,
  ArrowUp,
  ArrowDown,
  Plus,
  UserPlus,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Sub-components (server-only, no "use client")                      */
/* ------------------------------------------------------------------ */

function TrendBadge({ value }: { value: number }) {
  if (value === 0) return null;
  const isPositive = value > 0;
  return (
    <Badge
      variant={isPositive ? "success" : "danger"}
      size="sm"
      dot={false}
    >
      {isPositive ? (
        <ArrowUp className="h-3 w-3" aria-hidden="true" />
      ) : (
        <ArrowDown className="h-3 w-3" aria-hidden="true" />
      )}
      {Math.abs(value)}%
    </Badge>
  );
}

function StatCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: number;
}) {
  return (
    <Card variant="default" padding="lg">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-ghost text-amber-600 dark:text-amber-400">
          {icon}
        </div>
        {trend !== undefined && <TrendBadge value={trend} />}
      </div>
      <p className="mt-4 text-3xl font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
    </Card>
  );
}

function ActionRequiredCard({
  icon,
  label,
  count,
  href,
  badgeVariant,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  href: string;
  badgeVariant: "warning" | "danger";
}) {
  return (
    <Link
      href={href as `/${string}`}
      className="group block"
    >
      <Card variant="interactive" padding="md">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              badgeVariant === "warning"
                ? "bg-warning/10 text-amber-600 dark:text-amber-400"
                : "bg-danger/10 text-red-600 dark:text-red-400"
            }`}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {label}
            </p>
          </div>
          <Badge variant={badgeVariant} size="md" dot>
            {count}
          </Badge>
        </div>
      </Card>
    </Link>
  );
}

function QuickActionButton({
  icon,
  label,
  href,
  external = false,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  external?: boolean;
}) {
  const content = (
    <Card variant="interactive" padding="md">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors group-hover:bg-accent-ghost group-hover:text-amber-600 dark:group-hover:text-amber-400">
          {icon}
        </div>
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </span>
      </div>
    </Card>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href as `/${string}`} className="group block">
      {content}
    </Link>
  );
}

function OnboardingBanner({
  title,
  description,
  cta,
  href,
}: {
  title: string;
  description: string;
  cta: string;
  href: string;
}) {
  return (
    <Card variant="default" padding="none">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-ghost text-amber-600 dark:text-amber-400">
            <Rocket className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              {title}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          </div>
        </div>
        <Link
          href={href as `/${string}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-accent-hover"
        >
          {cta}
        </Link>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
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

  // Fetch agency slug for storefront link
  const { data: agency } = await supabase
    .from("agencies")
    .select("slug")
    .eq("id", membership.agency_id)
    .single();

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

  const showOnboarding = stats.active_listings < 3;

  const storefrontUrl = agency?.slug
    ? `/${locale}/a/${agency.slug}`
    : `/${locale}/AqarPro/dashboard`;

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

      {/* Onboarding banner — shown when agency is new */}
      {showOnboarding && (
        <OnboardingBanner
          title={t("onboarding_banner.title")}
          description={t("onboarding_banner.description")}
          cta={t("onboarding_banner.cta")}
          href="/AqarPro/dashboard/onboarding"
        />
      )}

      {/* KPI strip — 4 stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label={t("stats.activeListings")}
          value={String(stats.active_listings)}
          trend={stats.trend_listings !== 0 ? stats.trend_listings : undefined}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label={t("stats.totalLeads")}
          value={String(stats.leads_this_month)}
          trend={stats.trend_leads !== 0 ? stats.trend_leads : undefined}
        />
        <StatCard
          icon={<Eye className="h-5 w-5" />}
          label={t("stats.views")}
          value={new Intl.NumberFormat(locale).format(stats.views_30d)}
          trend={stats.trend_views !== 0 ? stats.trend_views : undefined}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label={t("stats.conversionRate")}
          value={conversionDisplay}
          trend={stats.trend_conversion !== 0 ? stats.trend_conversion : undefined}
        />
      </div>

      {/* Two-column layout: Actions required + Quick actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Action required */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            {t("section_action_required")}
          </h2>

          {(unansweredLeads ?? 0) > 0 || (expiringListings ?? 0) > 0 ? (
            <div className="space-y-2">
              {(unansweredLeads ?? 0) > 0 && (
                <ActionRequiredCard
                  icon={<AlertCircle className="h-5 w-5" />}
                  label={t("unanswered_leads", { count: unansweredLeads ?? 0 })}
                  count={unansweredLeads ?? 0}
                  href="/AqarPro/dashboard/leads"
                  badgeVariant="warning"
                />
              )}
              {(expiringListings ?? 0) > 0 && (
                <ActionRequiredCard
                  icon={<Clock className="h-5 w-5" />}
                  label={t("expiring_listings", { count: expiringListings ?? 0 })}
                  count={expiringListings ?? 0}
                  href="/AqarPro/dashboard/listings"
                  badgeVariant="danger"
                />
              )}
            </div>
          ) : (
            <Card variant="default" padding="lg">
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                {t("no_actions_required")}
              </p>
            </Card>
          )}
        </div>

        {/* Quick actions — 2x2 grid */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            {t("quick_actions")}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <QuickActionButton
              icon={<Plus className="h-5 w-5" />}
              label={t("new_listing")}
              href="/AqarPro/dashboard/listings/new"
            />
            <QuickActionButton
              icon={<UserPlus className="h-5 w-5" />}
              label={t("invite_member")}
              href="/AqarPro/dashboard/team"
            />
            <QuickActionButton
              icon={<BarChart3 className="h-5 w-5" />}
              label={t("view_analytics")}
              href="/AqarPro/dashboard/analytics"
            />
            <QuickActionButton
              icon={<ExternalLink className="h-5 w-5" />}
              label={t("view_storefront")}
              href={storefrontUrl}
              external
            />
          </div>
        </div>
      </div>
    </div>
  );
}
