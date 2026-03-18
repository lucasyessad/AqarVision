import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/auth/get-cached-user";
import { getAgencyForUser } from "@/lib/auth/get-agency-for-user";
import { getLeadsByAgency } from "@/features/leads/services/lead.service";
import { KanbanBoard } from "@/features/leads/components/KanbanBoard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("leads") };
}

export default async function LeadsPage() {
  const t = await getTranslations("nav");
  const tEmpty = await getTranslations("common.empty");

  const user = await getCachedUser();
  if (!user) redirect("/auth/login");

  const supabase = await createClient();
  const agencyCtx = await getAgencyForUser(user.id);
  if (!agencyCtx) redirect("/AqarPro/dashboard");

  let leads: import("@/features/leads/types/lead.types").Lead[] = [];
  try {
    leads = await getLeadsByAgency(supabase, agencyCtx.agencyId);
  } catch {
    // empty
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {t("leads")}
      </h1>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-12 w-12 text-stone-300 dark:text-stone-600 mb-4" />
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {tEmpty("noLeads")}
          </p>
        </div>
      ) : (
        <KanbanBoard leads={leads} agencyId={agencyCtx.agencyId} />
      )}
    </div>
  );
}
