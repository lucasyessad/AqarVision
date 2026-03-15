"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { ok, fail } from "@/types/action-result";
import { GetSignedUploadUrlSchema, FinalizeMediaUploadSchema, ALLOWED_TYPES, MAX_SIZE_BYTES } from "../schemas/media.schema";
import type { ActionResult } from "@/types/action-result";
import type { UploadUrlResult, MediaDto } from "../types/media.types";

// Storage path for individual-owned listings: individual/<userId>/<listingId>/<timestamp>_<file>
function buildIndividualStoragePath(userId: string, listingId: string, fileName: string): string {
  const timestamp = Date.now();
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `individual/${userId}/${listingId}/${timestamp}_${sanitized}`;
}

async function assertIndividualListingOwner(
  listingId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("owner_type, individual_owner_id")
    .eq("id", listingId)
    .single();
  return data?.owner_type === "individual" && data?.individual_owner_id === userId;
}

export async function getIndividualSignedUploadUrlAction(
  input: unknown
): Promise<ActionResult<UploadUrlResult>> {
  const parsed = GetSignedUploadUrlSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", parsed.error.errors.map((e) => e.message).join(", "));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("UNAUTHORIZED", "Connexion requise");

  const isOwner = await assertIndividualListingOwner(parsed.data.listing_id, user.id);
  if (!isOwner) return fail("FORBIDDEN", "Accès refusé à cette annonce.");

  const { content_type, file_size_bytes, file_name, listing_id } = parsed.data;

  if (!ALLOWED_TYPES.includes(content_type as (typeof ALLOWED_TYPES)[number])) {
    return fail("INVALID_TYPE", "Format non supporté. Utilisez JPEG, PNG ou WebP.");
  }
  if (file_size_bytes > MAX_SIZE_BYTES) {
    return fail("FILE_TOO_LARGE", "Photo trop volumineuse (max 10 Mo).");
  }

  const storagePath = buildIndividualStoragePath(user.id, listing_id, file_name);

  const { data, error } = await supabase.storage
    .from("listing-media")
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    logger.error({ err: error }, "getIndividualSignedUploadUrl failed");
    return fail("UPLOAD_URL_FAILED", "Impossible de préparer l'upload. Réessayez.");
  }

  return ok({
    signed_url: data.signedUrl,
    storage_path: storagePath,
    token: data.token,
  });
}

export async function finalizeIndividualMediaUploadAction(
  input: unknown
): Promise<ActionResult<MediaDto>> {
  const parsed = FinalizeMediaUploadSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", parsed.error.errors.map((e) => e.message).join(", "));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("UNAUTHORIZED", "Connexion requise");

  const { listing_id, storage_path, content_type, file_size_bytes } = parsed.data;

  const isOwner = await assertIndividualListingOwner(listing_id, user.id);
  if (!isOwner) return fail("FORBIDDEN", "Accès refusé à cette annonce.");

  // Determine next sort_order
  const { data: existing } = await supabase
    .from("listing_media")
    .select("sort_order")
    .eq("listing_id", listing_id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const firstExisting = existing?.[0];
  const nextOrder = firstExisting ? (firstExisting.sort_order as number) + 1 : 0;
  const isCover = nextOrder === 0;

  const { data: media, error } = await supabase
    .from("listing_media")
    .insert({
      listing_id,
      storage_path,
      content_type,
      file_size_bytes,
      is_cover: isCover,
      sort_order: nextOrder,
    })
    .select("id, listing_id, storage_path, content_type, file_size_bytes, width, height, is_cover, sort_order, created_at")
    .single();

  if (error || !media) {
    logger.error({ err: error, listing_id }, "finalizeIndividualMedia failed");
    return fail("FINALIZE_FAILED", "Erreur lors de l'enregistrement de la photo.");
  }

  // Generate signed URL for immediate display
  const { data: urlData } = await supabase.storage
    .from("listing-media")
    .createSignedUrl(storage_path, 3600);

  revalidateTag(`listing-media-${listing_id}`);

  const m = media as Record<string, unknown>;
  return ok({
    id: m.id as string,
    listing_id: m.listing_id as string,
    storage_path: m.storage_path as string,
    content_type: m.content_type as string,
    file_size_bytes: m.file_size_bytes as number,
    width: (m.width as number) ?? null,
    height: (m.height as number) ?? null,
    is_cover: m.is_cover as boolean,
    sort_order: m.sort_order as number,
    created_at: m.created_at as string,
    url: urlData?.signedUrl ?? "",
  });
}

export async function deleteIndividualMediaAction(
  input: unknown
): Promise<ActionResult<void>> {
  const parsed = (await import("../schemas/media.schema")).DeleteMediaSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", parsed.error.errors.map((e) => e.message).join(", "));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("UNAUTHORIZED", "Connexion requise");

  const { data: media } = await supabase
    .from("listing_media")
    .select("id, listing_id, storage_path")
    .eq("id", parsed.data.media_id)
    .single();

  if (!media) return fail("NOT_FOUND", "Photo introuvable.");

  const isOwner = await assertIndividualListingOwner(media.listing_id as string, user.id);
  if (!isOwner) return fail("FORBIDDEN", "Accès refusé.");

  await supabase.storage.from("listing-media").remove([media.storage_path as string]);
  await supabase.from("listing_media").delete().eq("id", parsed.data.media_id);

  revalidateTag(`listing-media-${media.listing_id}`);
  return ok(undefined);
}
