"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withSuperAdminAuth } from "@/lib/auth/with-super-admin-auth";
import type { ActionResult } from "@/features/agencies/types/agency.types";
import { RejectAgencySchema } from "../schemas/admin.schema";

export interface RejectAgencyDto {
  agencyId: string;
  verification_status: "rejected";
}

export async function rejectAgencyAction(
  agencyId: string,
  comment?: string
): Promise<ActionResult<RejectAgencyDto>> {
  const parsed = RejectAgencySchema.safeParse({ agencyId, comment });
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
      .update({ verification_status: "rejected" })
      .eq("id", parsed.data.agencyId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    revalidatePath("/admin/agencies");
    revalidatePath("/admin/verifications");

    return {
      agencyId: parsed.data.agencyId,
      verification_status: "rejected" as const,
    };
  });
}
