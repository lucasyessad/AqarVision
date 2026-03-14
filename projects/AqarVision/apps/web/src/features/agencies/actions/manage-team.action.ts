"use server";

import { createClient } from "@/lib/supabase/server";
import { ChangeMemberRoleSchema } from "../schemas/agency.schema";
import { changeMemberRole, deactivateMember, getUserMembership } from "../services/agency.service";
import type { ActionResult } from "../types/agency.types";

const TEAM_MANAGE_ROLES = ["owner", "admin"] as const;

export async function changeMemberRoleAction(
  _prevState: ActionResult<{ updated: boolean }> | null,
  formData: FormData
): Promise<ActionResult<{ updated: boolean }>> {
  const parsed = ChangeMemberRoleSchema.safeParse({
    agency_id: formData.get("agency_id"),
    user_id: formData.get("user_id"),
    new_role: formData.get("new_role"),
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

  if (!membership || !TEAM_MANAGE_ROLES.includes(membership.role as "owner" | "admin")) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Insufficient permissions to manage team" },
    };
  }

  try {
    await changeMemberRole(
      supabase,
      parsed.data.agency_id,
      parsed.data.user_id,
      parsed.data.new_role
    );
    return { success: true, data: { updated: true } };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "ROLE_CHANGE_FAILED",
        message: err instanceof Error ? err.message : "Failed to change member role",
      },
    };
  }
}

export async function deactivateMemberAction(
  _prevState: ActionResult<{ deactivated: boolean }> | null,
  formData: FormData
): Promise<ActionResult<{ deactivated: boolean }>> {
  const agencyId = formData.get("agency_id") as string;
  const targetUserId = formData.get("user_id") as string;

  if (!agencyId || !targetUserId) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Missing agency_id or user_id" },
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

  const membership = await getUserMembership(supabase, agencyId, user.id);

  if (!membership || !TEAM_MANAGE_ROLES.includes(membership.role as "owner" | "admin")) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Insufficient permissions to deactivate members" },
    };
  }

  try {
    await deactivateMember(supabase, agencyId, targetUserId);
    return { success: true, data: { deactivated: true } };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "DEACTIVATE_FAILED",
        message: err instanceof Error ? err.message : "Failed to deactivate member",
      },
    };
  }
}
