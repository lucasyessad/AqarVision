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
        <p className="text-sm text-gray-500">{t("no_jobs")}</p>
      </div>
    );
  }

  const agencyId = membership.agency_id as string;

  const [jobs, quota] = await Promise.all([
    getJobHistory(supabase, agencyId),
    checkQuota(supabase, agencyId),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-night">{t("title")}</h1>

      {/* Usage Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            {t("jobs_used")}
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-night">
            {quota.used}{" "}
            <span className="text-base font-normal text-gray-400">
              / {quota.max}
            </span>
          </p>
          {/* Usage bar */}
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{
                width: `${quota.max > 0 ? Math.min(100, (quota.used / quota.max) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Job History */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-blue-night">
          {t("job_history")}
        </h2>
        <AiJobHistory jobs={jobs} />
      </div>
    </div>
  );
}
