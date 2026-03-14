"use server";

import { createClient } from "@/lib/supabase/server";
import { DateRangeSchema } from "../schemas/analytics.schema";
import { getAgencyStats, getAgencySummary } from "../services/analytics.service";
import type { ActionResult } from "../types/analytics.types";
import type { AgencyStatsDto, AnalyticsSummary } from "../types/analytics.types";

export async function getAgencyStatsAction(
  _prevState: ActionResult<AgencyStatsDto[]> | null,
  formData: FormData
): Promise<ActionResult<AgencyStatsDto[]>> {
  const raw = {
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  };

  const parsed = DateRangeSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    };
  }

  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!membership) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "No active agency membership" },
    };
  }

  try {
    const stats = await getAgencyStats(
      supabase,
      membership.agency_id as string,
      parsed.data.start_date,
      parsed.data.end_date
    );
    return { success: true, data: stats };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch stats";
    return {
      success: false,
      error: { code: "STATS_ERROR", message },
    };
  }
}

export async function getAgencySummaryAction(): Promise<ActionResult<AnalyticsSummary>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    };
  }

  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!membership) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "No active agency membership" },
    };
  }

  try {
    const summary = await getAgencySummary(supabase, membership.agency_id as string);
    return { success: true, data: summary };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch summary";
    return {
      success: false,
      error: { code: "SUMMARY_ERROR", message },
    };
  }
}
