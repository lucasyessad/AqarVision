"use server";

import { createClient } from "@/lib/supabase/server";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { createVisitRequestSchema } from "../schemas/visit-request.schema";
import { createVisitRequest, updateVisitRequestStatus } from "../services/visit-request.service";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { contactRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { updateTag } from "next/cache";
import { CacheTags } from "@/lib/cache/tags";
import type { CreateVisitRequestInput } from "../schemas/visit-request.schema";

export async function createVisitRequestAction(
  input: CreateVisitRequestInput
): Promise<ActionResult<{ requestId: string }>> {
  const parsed = createVisitRequestSchema.safeParse(input);
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
    const vr = await createVisitRequest(supabase, parsed.data, user?.id ?? null);
    updateTag(CacheTags.visitRequests(parsed.data.agency_id));
    return ok({ requestId: vr.id });
  } catch {
    return fail("INTERNAL_ERROR", "Erreur lors de la création de la demande");
  }
}

export async function updateVisitRequestStatusAction(
  requestId: string,
  status: "confirmed" | "completed" | "cancelled",
  agencyId: string
): Promise<ActionResult<void>> {
  return withAgencyAuth(agencyId, "listing", "update", async () => {
    const supabase = await createClient();
    await updateVisitRequestStatus(supabase, requestId, status);
    updateTag(CacheTags.visitRequests(agencyId));
  });
}
