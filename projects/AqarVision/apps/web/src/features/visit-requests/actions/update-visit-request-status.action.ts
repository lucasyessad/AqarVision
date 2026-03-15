"use server";

import { createClient } from "@/lib/supabase/server";
import { UpdateVisitRequestStatusSchema } from "../schemas/visit-requests.schema";
import { updateVisitRequestStatus } from "../services/visit-requests.service";
import type { ActionResult } from "../types/visit-requests.types";
import { revalidatePath } from "next/cache";

interface UpdateResult {
  id: string;
  status: string;
}

export async function updateVisitRequestStatusAction(
  input: unknown
): Promise<ActionResult<UpdateResult>> {
  // 1. Validate input
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

  // 2. Resolve actor
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

  // 3. Check membership
  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("id")
    .eq("agency_id", parsed.data.agencyId)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!membership) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Not a member of this agency" },
    };
  }

  // 4. Verify request belongs to agency
  const { data: visitRequest } = await supabase
    .from("visit_requests")
    .select("id")
    .eq("id", parsed.data.requestId)
    .eq("agency_id", parsed.data.agencyId)
    .single();

  if (!visitRequest) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Visit request not found" },
    };
  }

  // 5. Update
  try {
    const result = await updateVisitRequestStatus(
      supabase,
      parsed.data.requestId,
      parsed.data.status
    );

    revalidatePath("/AqarPro/dashboard/visit-requests");

    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "UPDATE_FAILED",
        message: err instanceof Error ? err.message : "Update failed",
      },
    };
  }
}
