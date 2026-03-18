import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Building2, Users, AlertTriangle, ShieldCheck, CreditCard, Activity } from "lucide-react";
import { getCachedUser } from "@/lib/auth/get-cached-user";
import { createClient } from "@/lib/supabase/server";
import { getAuditLogs } from "@/features/admin/services/admin.service";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return { title: t("admin") };
}

export default async function AdminPage() {
  const t = await getTranslations("admin");
  const user = await getCachedUser();

  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await createClient();

  // Check super_admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    redirect("/");
  }

  // Fetch stats in parallel
  const [
    { count: agenciesCount },
    { count: usersCount },
    { count: pendingModerationCount },
    { count: pendingVerificationsCount },
    { count: pendingPaymentsCount },
    recentLogs,
  ] = await Promise.all([
    supabase.from("agencies").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_review"),
    supabase
      .from("verifications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("individual_payments")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "pending_verification"),
    getAuditLogs(supabase, { page: 1, per_page: 10 }),
  ]);

  const stats = [
    {
      label: t("totalAgencies"),
      value: agenciesCount ?? 0,
      icon: Building2,
      href: "/admin/agencies",
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-950/30",
    },
    {
      label: t("totalUsers"),
      value: usersCount ?? 0,
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: t("pendingModeration"),
      value: pendingModerationCount ?? 0,
      icon: AlertTriangle,
      href: "/admin/moderation",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: t("pendingVerifications"),
      value: pendingVerificationsCount ?? 0,
      icon: ShieldCheck,
      href: "/admin/verifications",
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      label: t("pendingPayments"),
      value: pendingPaymentsCount ?? 0,
      icon: CreditCard,
      href: "/admin/payments",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/30",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {t("overview")}
      </h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="flex items-center gap-4 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4 transition-shadow hover:shadow-md"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-50">
                {stat.value}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {stat.label}
              </p>
            </div>
          </a>
        ))}
      </div>

      {/* Recent activity */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-stone-500 dark:text-stone-400" />
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            {t("recentActivity")}
          </h2>
        </div>
        <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 divide-y divide-stone-100 dark:divide-stone-700">
          {recentLogs.data.length === 0 ? (
            <p className="p-6 text-sm text-stone-500 dark:text-stone-400 text-center">
              &mdash;
            </p>
          ) : (
            recentLogs.data.map((log) => {
              const actor = log.actor as { first_name: string; last_name: string } | null;
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-700 text-xs font-medium text-stone-600 dark:text-stone-300">
                      {actor?.first_name?.[0] ?? "?"}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                        {actor
                          ? `${actor.first_name} ${actor.last_name}`
                          : log.actor_id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {log.action}
                      </p>
                    </div>
                  </div>
                  <time
                    className="text-xs text-stone-400 dark:text-stone-500"
                    dateTime={log.created_at}
                  >
                    {new Date(log.created_at).toLocaleDateString("fr-DZ", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
