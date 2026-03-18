"use server";

import { createClient } from "@/lib/supabase/server";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { createLeadSchema, updateLeadStatusSchema } from "../schemas/lead.schema";
import { createLead, updateLeadStatus } from "../services/lead.service";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { contactRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { updateTag } from "next/cache";
import { CacheTags } from "@/lib/cache/tags";
import type { Lead } from "../types/lead.types";
import type { CreateLeadInput, UpdateLeadStatusInput } from "../schemas/lead.schema";

export async function createAnonymousLeadAction(
  input: CreateLeadInput
): Promise<ActionResult<{ leadId: string }>> {
  const parsed = createLeadSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Données invalides");
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success: rateLimitOk } = await contactRateLimit.limit(ip);
  if (!rateLimitOk) {
    return fail("RATE_LIMITED", "Trop de tentatives. Réessayez plus tard.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const lead = await createLead(supabase, parsed.data, user?.id ?? null);
    updateTag(CacheTags.leads(parsed.data.agency_id));
    return ok({ leadId: lead.id });
  } catch {
    return fail("INTERNAL_ERROR", "Erreur lors de la création du lead");
  }
}

export async function updateLeadStatusAction(
  input: UpdateLeadStatusInput,
  agencyId: string
): Promise<ActionResult<void>> {
  const parsed = updateLeadStatusSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Données invalides");
  }

  return withAgencyAuth(agencyId, "listing", "update", async () => {
    const supabase = await createClient();
    await updateLeadStatus(supabase, parsed.data.lead_id, parsed.data.status);
    updateTag(CacheTags.leads(agencyId));
  });
}
