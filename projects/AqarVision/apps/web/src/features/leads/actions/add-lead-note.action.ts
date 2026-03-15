"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { AddLeadNoteSchema } from "../schemas/leads.schema";
import { addLeadNote } from "../services/leads.service";
import type { ActionResult, LeadNoteDto } from "../types/leads.types";

export async function addLeadNoteAction(
  input: unknown
): Promise<ActionResult<{ notes: LeadNoteDto[] }>> {
  const parsed = AddLeadNoteSchema.safeParse(input);
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

    const notes = await addLeadNote(supabase, parsed.data.leadId, parsed.data.note, ctx.userId);
    revalidatePath("/AqarPro/dashboard/leads");
    return { notes };
  });
}
