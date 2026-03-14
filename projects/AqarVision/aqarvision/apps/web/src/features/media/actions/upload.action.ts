"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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

  // Get listing to find agency_id and check membership
  const { data: listing } = await supabase
    .from("listings")
    .select("agency_id")
    .eq("id", parsed.data.listing_id)
    .single();

  if (!listing) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Listing not found" },
    };
  }

  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("id")
    .eq("agency_id", listing.agency_id as string)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!membership) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Not a member of this agency" },
    };
  }

  try {
    const result = await getSignedUploadUrl(
      supabase,
      listing.agency_id as string,
      parsed.data.listing_id,
      parsed.data.file_name,
      parsed.data.content_type,
      parsed.data.file_size_bytes
    );
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "UPLOAD_URL_FAILED",
        message:
          err instanceof Error ? err.message : "Failed to get upload URL",
      },
    };
  }
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

  // Check listing ownership via agency membership
  const { data: listing } = await supabase
    .from("listings")
    .select("agency_id")
    .eq("id", parsed.data.listing_id)
    .single();

  if (!listing) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Listing not found" },
    };
  }

  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("id")
    .eq("agency_id", listing.agency_id as string)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!membership) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Not a member of this agency" },
    };
  }

  try {
    const result = await finalizeUpload(
      supabase,
      parsed.data.listing_id,
      parsed.data.storage_path,
      parsed.data.content_type,
      parsed.data.file_size_bytes
    );

    revalidateTag(`listing-media-${parsed.data.listing_id}`);

    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "FINALIZE_FAILED",
        message:
          err instanceof Error ? err.message : "Failed to finalize upload",
      },
    };
  }
}
