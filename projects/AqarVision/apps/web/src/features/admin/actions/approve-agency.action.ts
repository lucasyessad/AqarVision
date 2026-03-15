"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withSuperAdminAuth } from "@/lib/auth/with-super-admin-auth";
import type { ActionResult } from "@/features/agencies/types/agency.types";
import { ApproveAgencySchema } from "../schemas/admin.schema";

export interface ApproveAgencyDto {
  agencyId: string;
  verification_status: "verified";
  is_verified: true;
}

export async function approveAgencyAction(
  agencyId: string
): Promise<ActionResult<ApproveAgencyDto>> {
  const parsed = ApproveAgencySchema.safeParse({ agencyId });
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  return withSuperAdminAuth(async () => {
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from("agencies")
      .update({ is_verified: true, verification_status: "verified" })
      .eq("id", parsed.data.agencyId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    revalidatePath("/admin/agencies");
    revalidatePath("/admin/verifications");

    return {
      agencyId: parsed.data.agencyId,
      verification_status: "verified" as const,
      is_verified: true as const,
    };
  });
}
