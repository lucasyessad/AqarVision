"use server";

import { createClient } from "@/lib/supabase/server";
import { AcceptInviteSchema } from "../schemas/agency.schema";
import { acceptInvite } from "../services/agency.service";
import type { ActionResult, MembershipDto } from "../types/agency.types";

export async function acceptInviteAction(
  _prevState: ActionResult<MembershipDto> | null,
  formData: FormData
): Promise<ActionResult<MembershipDto>> {
  const parsed = AcceptInviteSchema.safeParse({
    token: formData.get("token"),
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

  try {
    const membership = await acceptInvite(supabase, user.id, parsed.data.token);
    return { success: true, data: membership };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "ACCEPT_FAILED",
        message: err instanceof Error ? err.message : "Failed to accept invite",
      },
    };
  }
}
