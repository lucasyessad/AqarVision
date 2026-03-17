import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getJobHistory, checkQuota } from "@/features/ai/services/ai.service";
import { AiJobHistory } from "@/features/ai/components";

export default async function AiDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("ai");

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
      <div className="flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-16 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("no_jobs")}</p>
      </div>
    );
  }

  const agencyId = membership.agency_id as string;
  const [jobs, quota] = await Promise.all([
    getJobHistory(supabase, agencyId),
    checkQuota(supabase, agencyId),
  ]);

  const pct = quota.max > 0 ? Math.min(100, (quota.used / quota.max) * 100) : 0;
  const barColorClass = pct > 90 ? "bg-red-600" : pct > 70 ? "bg-yellow-600" : "bg-amber-500";

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Génération automatique de titres, descriptions et traductions.
        </p>
      </div>

      {/* Quota card */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 dark:border-zinc-700 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            Quota mensuel
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Réinitialisé le 1er de chaque mois.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 border-b border-zinc-200 dark:border-zinc-700 p-6 dark:border-zinc-800 md:grid-cols-[240px_1fr]">
          <div>
            <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
              {t("jobs_used")}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Tâches IA utilisées ce mois-ci.
            </p>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
                {quota.used}
              </span>
              <span className="text-sm text-zinc-400 dark:text-zinc-500">/ {quota.max}</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColorClass}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              {quota.max - quota.used} tâche{quota.max - quota.used !== 1 ? "s" : ""} restante{quota.max - quota.used !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800 px-6 py-4 dark:bg-zinc-900/50">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Augmentez votre quota en passant au plan Pro ou Enterprise.
          </p>
        </div>
      </div>

      {/* Job history card */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 dark:border-zinc-700 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            {t("job_history")}
          </h2>
        </div>
        <div className="p-6">
          <AiJobHistory jobs={jobs} />
        </div>
      </div>
    </div>
  );
}
