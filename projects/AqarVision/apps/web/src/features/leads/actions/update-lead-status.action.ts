"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { UpdateLeadStatusSchema } from "../schemas/leads.schema";
import { updateLeadStatus } from "../services/leads.service";
import type { ActionResult } from "../types/leads.types";

interface UpdateLeadStatusResult {
  id: string;
  status: string;
  updated_at: string;
}

export async function updateLeadStatusAction(
  input: unknown
): Promise<ActionResult<UpdateLeadStatusResult>> {
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

  return withAgencyAuth(parsed.data.agencyId, "listing", "update", async (ctx) => {
    const supabase = await createClient();

    // Verify lead belongs to this agency
    const { data: lead } = await supabase
      .from("leads")
      .select("id")
      .eq("id", parsed.data.leadId)
      .eq("agency_id", ctx.agencyId)
      .single();

    if (!lead) {
      const err = new Error("Lead not found");
      err.name = "NOT_FOUND";
      throw err;
    }

    const result = await updateLeadStatus(supabase, parsed.data.leadId, parsed.data.status);
    revalidatePath("/AqarPro/dashboard/leads");
    return result;
  });
}
