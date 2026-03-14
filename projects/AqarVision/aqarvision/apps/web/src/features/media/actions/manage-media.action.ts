"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  ReorderMediaSchema,
  SetCoverSchema,
  DeleteMediaSchema,
} from "../schemas/media.schema";
import {
  reorderMedia,
  setCover,
  deleteMedia,
} from "../services/media.service";
import type { ActionResult } from "../types/media.types";

export async function reorderMediaAction(
  input: unknown
): Promise<ActionResult<void>> {
  const parsed = ReorderMediaSchema.safeParse(input);

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
    await reorderMedia(supabase, parsed.data.listing_id, parsed.data.ordered_media_ids);
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "REORDER_FAILED",
        message: err instanceof Error ? err.message : "Failed to reorder media",
      },
    };
  }
}

export async function setCoverAction(
  input: unknown
): Promise<ActionResult<void>> {
  const parsed = SetCoverSchema.safeParse(input);

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
    await setCover(supabase, parsed.data.listing_id, parsed.data.media_id);
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "SET_COVER_FAILED",
        message: err instanceof Error ? err.message : "Failed to set cover",
      },
    };
  }
}

export async function deleteMediaAction(
  input: unknown
): Promise<ActionResult<void>> {
  const parsed = DeleteMediaSchema.safeParse(input);

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

  // Fetch media to get listing_id, then check membership
  const { data: media } = await supabase
    .from("listing_media")
    .select("listing_id")
    .eq("id", parsed.data.media_id)
    .single();

  if (!media) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Media not found" },
    };
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("agency_id")
    .eq("id", media.listing_id as string)
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
    await deleteMedia(supabase, parsed.data.media_id);

    revalidateTag(`listing-media-${media.listing_id}`);

    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "DELETE_FAILED",
        message: err instanceof Error ? err.message : "Failed to delete media",
      },
    };
  }
}
