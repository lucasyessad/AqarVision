"use server";

import { createClient } from "@/lib/supabase/server";
import { UpdateLeadStatusSchema } from "../schemas/leads.schema";
import { updateLeadStatus } from "../services/leads.service";
import type { ActionResult } from "../types/leads.types";
import { revalidatePath } from "next/cache";

interface UpdateLeadStatusResult {
  id: string;
  status: string;
  updated_at: string;
}

export async function updateLeadStatusAction(
  input: unknown
): Promise<ActionResult<UpdateLeadStatusResult>> {
  // 1. Validate input
  const parsed = UpdateLeadStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  // 2. Resolve current actor
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

  // 3. Check membership in agency
  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("id, role")
    .eq("agency_id", parsed.data.agencyId)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!membership) {
    return {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "You are not a member of this agency",
      },
    };
  }

  // 4. Verify lead belongs to this agency
  const { data: lead } = await supabase
    .from("leads")
    .select("id, agency_id")
    .eq("id", parsed.data.leadId)
    .eq("agency_id", parsed.data.agencyId)
    .single();

  if (!lead) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Lead not found" },
    };
  }

  // 5. Call domain service
  try {
    const result = await updateLeadStatus(
      supabase,
      parsed.data.leadId,
      parsed.data.status
    );

    // 6. Revalidate leads page
    revalidatePath("/dashboard/leads");

    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "UPDATE_FAILED",
        message:
          err instanceof Error ? err.message : "Failed to update lead status",
      },
    };
  }
}
