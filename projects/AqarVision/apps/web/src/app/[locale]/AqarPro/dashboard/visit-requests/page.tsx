import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { CalendarCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/auth/get-cached-user";
import { getAgencyForUser } from "@/lib/auth/get-agency-for-user";
import { getVisitRequests } from "@/features/visit-requests/services/visit-request.service";
import { CalendarView } from "@/features/visit-requests/components/CalendarView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("visits") };
}

export default async function VisitRequestsPage() {
  const t = await getTranslations("nav");
  const tEmpty = await getTranslations("common.empty");

  const user = await getCachedUser();
  if (!user) redirect("/auth/login");

  const supabase = await createClient();
  const agencyCtx = await getAgencyForUser(user.id);
  if (!agencyCtx) redirect("/AqarPro/dashboard");

  let visits: Awaited<ReturnType<typeof getVisitRequests>> = [];
  try {
    visits = await getVisitRequests(supabase, agencyCtx.agencyId);
  } catch {
    // empty
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {t("visits")}
      </h1>

      {visits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CalendarCheck className="h-12 w-12 text-stone-300 dark:text-stone-600 mb-4" />
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {tEmpty("noVisits")}
          </p>
        </div>
      ) : (
        <CalendarView visits={visits} agencyId={agencyCtx.agencyId} />
      )}
    </div>
  );
}
