"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import {
  GetSignedUploadUrlSchema,
  FinalizeMediaUploadSchema,
} from "../schemas/media.schema";
import {
  getSignedUploadUrl,
  finalizeUpload,
} from "../services/media.service";
import type { ActionResult } from "../types/media.types";
import type { UploadUrlResult, MediaDto } from "../types/media.types";

async function getListingAgencyId(listingId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("agency_id")
    .eq("id", listingId)
    .single();
  return data?.agency_id as string | null;
}

export async function getSignedUploadUrlAction(
  input: unknown
): Promise<ActionResult<UploadUrlResult>> {
  const parsed = GetSignedUploadUrlSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  const agencyId = await getListingAgencyId(parsed.data.listing_id);
  if (!agencyId) {
    return { success: false, error: { code: "NOT_FOUND", message: "Listing not found" } };
  }

  return withAgencyAuth(agencyId, "media", "create", async (ctx) => {
    const supabase = await createClient();
    return getSignedUploadUrl(
      supabase,
      ctx.agencyId,
      parsed.data.listing_id,
      parsed.data.file_name,
      parsed.data.content_type,
      parsed.data.file_size_bytes
    );
  });
}

export async function finalizeMediaUploadAction(
  input: unknown
): Promise<ActionResult<MediaDto>> {
  const parsed = FinalizeMediaUploadSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  const agencyId = await getListingAgencyId(parsed.data.listing_id);
  if (!agencyId) {
    return { success: false, error: { code: "NOT_FOUND", message: "Listing not found" } };
  }

  return withAgencyAuth(agencyId, "media", "create", async () => {
    const supabase = await createClient();
    const result = await finalizeUpload(
      supabase,
      parsed.data.listing_id,
      parsed.data.storage_path,
      parsed.data.content_type,
      parsed.data.file_size_bytes
    );
    revalidateTag(`listing-media-${parsed.data.listing_id}`);
    return result;
  });
}
