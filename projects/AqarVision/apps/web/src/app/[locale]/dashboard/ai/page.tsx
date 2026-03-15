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

  if (!user) redirect(`/${locale}/auth/login`);

  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!membership) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-white py-16" style={{ borderColor: "#E3E8EF" }}>
        <p className="text-sm" style={{ color: "var(--charcoal-500)" }}>{t("no_jobs")}</p>
      </div>
    );
  }

  const agencyId = membership.agency_id as string;
  const [jobs, quota] = await Promise.all([
    getJobHistory(supabase, agencyId),
    checkQuota(supabase, agencyId),
  ]);

  const pct = quota.max > 0 ? Math.min(100, (quota.used / quota.max) * 100) : 0;
  const barColor = pct > 90 ? "#DC2626" : pct > 70 ? "#D97706" : "var(--coral)";

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal-950)" }}>
          {t("title")}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--charcoal-500)" }}>
          Génération automatique de titres, descriptions et traductions.
        </p>
      </div>

      {/* Quota card */}
      <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
        <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
            Quota mensuel
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: "var(--charcoal-500)" }}>
            Réinitialisé le 1er de chaque mois.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 border-b p-6 md:grid-cols-[240px_1fr]" style={{ borderColor: "#E3E8EF" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--charcoal-950)" }}>
              {t("jobs_used")}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--charcoal-500)" }}>
              Tâches IA utilisées ce mois-ci.
            </p>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold tabular-nums" style={{ color: "var(--charcoal-950)" }}>
                {quota.used}
              </span>
              <span className="text-sm" style={{ color: "var(--charcoal-400)" }}>/ {quota.max}</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "#E3E8EF" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: barColor }}
              />
            </div>
            <p className="mt-1 text-xs" style={{ color: "var(--charcoal-400)" }}>
              {quota.max - quota.used} tâche{quota.max - quota.used !== 1 ? "s" : ""} restante{quota.max - quota.used !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="px-6 py-4" style={{ background: "#F6F9FC" }}>
          <p className="text-xs" style={{ color: "var(--charcoal-500)" }}>
            Augmentez votre quota en passant au plan Pro ou Enterprise.
          </p>
        </div>
      </div>

      {/* Job history card */}
      <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
        <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
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
