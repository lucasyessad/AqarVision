"use server";

import { createClient } from "@/lib/supabase/server";
import { CreateBranchSchema } from "../schemas/agency.schema";
import { createBranch, getUserMembership } from "../services/agency.service";
import type { ActionResult, BranchDto } from "../types/agency.types";

const SETTINGS_CREATE_ROLES = ["owner", "admin"] as const;

export async function createBranchAction(
  _prevState: ActionResult<BranchDto> | null,
  formData: FormData
): Promise<ActionResult<BranchDto>> {
  const parsed = CreateBranchSchema.safeParse({
    agency_id: formData.get("agency_id"),
    name: formData.get("name"),
    wilaya_code: formData.get("wilaya_code"),
    commune_id: formData.get("commune_id")
      ? Number(formData.get("commune_id"))
      : undefined,
    address_text: formData.get("address_text") || undefined,
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

  if (!membership || !SETTINGS_CREATE_ROLES.includes(membership.role as "owner" | "admin")) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Insufficient permissions to create branches" },
    };
  }

  try {
    const branch = await createBranch(supabase, parsed.data);
    return { success: true, data: branch };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "CREATE_BRANCH_FAILED",
        message: err instanceof Error ? err.message : "Failed to create branch",
      },
    };
  }
}
