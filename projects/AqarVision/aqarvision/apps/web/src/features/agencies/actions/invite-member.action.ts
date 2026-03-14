"use server";

import { createClient } from "@/lib/supabase/server";
import { InviteMemberSchema } from "../schemas/agency.schema";
import { inviteMember, getUserMembership } from "../services/agency.service";
import type { ActionResult, InviteDto } from "../types/agency.types";

const INVITATION_CREATE_ROLES = ["owner", "admin"] as const;

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

  const membership = await getUserMembership(supabase, parsed.data.agency_id, user.id);

  if (!membership || !INVITATION_CREATE_ROLES.includes(membership.role as "owner" | "admin")) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Insufficient permissions to invite members" },
    };
  }

  try {
    const invite = await inviteMember(supabase, parsed.data);
    return { success: true, data: invite };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "INVITE_FAILED",
        message: err instanceof Error ? err.message : "Failed to send invite",
      },
    };
  }
}
