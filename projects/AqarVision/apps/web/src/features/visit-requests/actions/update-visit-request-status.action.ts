"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { UpdateVisitRequestStatusSchema } from "../schemas/visit-requests.schema";
import { updateVisitRequestStatus } from "../services/visit-requests.service";
import type { ActionResult } from "../types/visit-requests.types";

interface UpdateResult {
  id: string;
  status: string;
}

export async function updateVisitRequestStatusAction(
  input: unknown
): Promise<ActionResult<UpdateResult>> {
  const parsed = UpdateVisitRequestStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  return withAgencyAuth(parsed.data.agencyId, "listing", "update", async (ctx) => {
    const supabase = await createClient();

    // Verify request belongs to this agency
    const { data: visitRequest } = await supabase
      .from("visit_requests")
      .select("id")
      .eq("id", parsed.data.requestId)
      .eq("agency_id", ctx.agencyId)
      .single();

    if (!visitRequest) {
      const err = new Error("Visit request not found");
      err.name = "NOT_FOUND";
      throw err;
    }

    const result = await updateVisitRequestStatus(supabase, parsed.data.requestId, parsed.data.status);
    revalidatePath("/AqarPro/dashboard/visit-requests");
    return result;
  });
}
