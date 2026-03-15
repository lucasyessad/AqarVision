"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withSuperAdminAuth } from "@/lib/auth/with-super-admin-auth";
import type { ActionResult } from "@/features/agencies/types/agency.types";
import { SuspendAgencySchema } from "../schemas/admin.schema";

export interface SuspendAgencyDto {
  agencyId: string;
  suspended_at: string;
}

export async function suspendAgencyAction(
  agencyId: string
): Promise<ActionResult<SuspendAgencyDto>> {
  const parsed = SuspendAgencySchema.safeParse({ agencyId });
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
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("agencies")
      .update({ deleted_at: now })
      .eq("id", parsed.data.agencyId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    revalidatePath("/admin/agencies");

    return { agencyId: parsed.data.agencyId, suspended_at: now };
  });
}
