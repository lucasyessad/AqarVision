"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
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

  // Fetch listing's agency_id to guard with withAgencyAuth
  const supabase = await createClient();
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

  return withAgencyAuth(listing.agency_id as string, "media", "update", async () => {
    const sb = await createClient();
    await reorderMedia(sb, parsed.data.listing_id, parsed.data.ordered_media_ids);
    revalidatePath("/[locale]/annonce", "page");
    return undefined;
  });
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

  // Fetch listing's agency_id to guard with withAgencyAuth
  const supabase = await createClient();
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

  return withAgencyAuth(listing.agency_id as string, "media", "update", async () => {
    const sb = await createClient();
    await setCover(sb, parsed.data.listing_id, parsed.data.media_id);
    revalidatePath("/[locale]/annonce", "page");
    return undefined;
  });
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

  // Fetch media to get listing_id, then listing to get agency_id
  const supabase = await createClient();
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

  const listingId = media.listing_id as string;

  return withAgencyAuth(listing.agency_id as string, "media", "delete", async () => {
    const sb = await createClient();
    await deleteMedia(sb, parsed.data.media_id);
    revalidateTag(`listing-media-${listingId}`);
    revalidatePath("/[locale]/annonce", "page");
    return undefined;
  });
}
