"use server";

import { createClient } from "@/lib/supabase/server";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { InviteMemberSchema } from "../schemas/agency.schema";
import { inviteMember } from "../services/agency.service";
import type { ActionResult, InviteDto } from "../types/agency.types";

export async function inviteMemberAction(
  _prevState: ActionResult<InviteDto> | null,
  formData: FormData
): Promise<ActionResult<InviteDto>> {
  const parsed = InviteMemberSchema.safeParse({
    agency_id: formData.get("agency_id"),
    email: formData.get("email"),
    role: formData.get("role"),
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

  return withAgencyAuth(parsed.data.agency_id, "invitation", "create", async () => {
    const supabase = await createClient();
    return inviteMember(supabase, parsed.data);
  });
}
