"use server";

import { createClient } from "@/lib/supabase/server";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { DateRangeSchema } from "../schemas/analytics.schema";
import { getAgencyStats, getAgencySummary } from "../services/analytics.service";
import type { ActionResult } from "../types/analytics.types";
import type { AgencyStatsDto, AnalyticsSummary } from "../types/analytics.types";

/** Résout l'agency_id de l'utilisateur courant (première adhésion active). */
async function resolveUserAgencyId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .single();

  return membership?.agency_id as string | null;
}

export async function getAgencyStatsAction(
  _prevState: ActionResult<AgencyStatsDto[]> | null,
  formData: FormData
): Promise<ActionResult<AgencyStatsDto[]>> {
  const parsed = DateRangeSchema.safeParse({
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  const agencyId = await resolveUserAgencyId();
  if (!agencyId) {
    return { success: false, error: { code: "FORBIDDEN", message: "No active agency membership" } };
  }

  return withAgencyAuth(agencyId, "analytics", "read", async (ctx) => {
    const supabase = await createClient();
    return getAgencyStats(supabase, ctx.agencyId, parsed.data.start_date, parsed.data.end_date);
  });
}

export async function getAgencySummaryAction(): Promise<ActionResult<AnalyticsSummary>> {
  const agencyId = await resolveUserAgencyId();
  if (!agencyId) {
    return { success: false, error: { code: "FORBIDDEN", message: "No active agency membership" } };
  }

  return withAgencyAuth(agencyId, "analytics", "read", async (ctx) => {
    const supabase = await createClient();
    return getAgencySummary(supabase, ctx.agencyId);
  });
}
