import type { SupabaseClient } from "@supabase/supabase-js";
import type { MediaDto, UploadUrlResult } from "../types/media.types";
import { ALLOWED_TYPES, MAX_SIZE_BYTES } from "../schemas/media.schema";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function buildStoragePath(
  agencyId: string,
  listingId: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${agencyId}/${listingId}/${timestamp}_${sanitized}`;
}

/* ------------------------------------------------------------------ */
/*  Upload                                                             */
/* ------------------------------------------------------------------ */

export async function getSignedUploadUrl(
  supabase: SupabaseClient,
  agencyId: string,
  listingId: string,
  fileName: string,
  contentType: string,
  fileSizeBytes: number
): Promise<UploadUrlResult> {
  if (!ALLOWED_TYPES.includes(contentType as (typeof ALLOWED_TYPES)[number])) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  if (fileSizeBytes > MAX_SIZE_BYTES) {
    throw new Error(`File size exceeds maximum of ${MAX_SIZE_BYTES} bytes`);
  }

  const storagePath = buildStoragePath(agencyId, listingId, fileName);

  const { data, error } = await supabase.storage
    .from("listing-media")
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create signed upload URL");
  }

  return {
    signed_url: data.signedUrl,
    storage_path: storagePath,
  };
}

export async function finalizeUpload(
  supabase: SupabaseClient,
  listingId: string,
  storagePath: string,
  contentType: string,
  fileSizeBytes: number
): Promise<MediaDto> {
  // Determine next sort_order
  const { data: existing } = await supabase
    .from("listing_media")
    .select("sort_order")
    .eq("listing_id", listingId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const firstExisting = existing?.[0];
  const nextOrder =
    firstExisting
      ? (firstExisting.sort_order as number) + 1
      : 0;

  // If this is the first media, set it as cover
  const isCover = nextOrder === 0;

  const { data: media, error } = await supabase
    .from("listing_media")
    .insert({
      listing_id: listingId,
      storage_path: storagePath,
      content_type: contentType,
      file_size_bytes: fileSizeBytes,
      is_cover: isCover,
      sort_order: nextOrder,
    })
    .select(
      "id, listing_id, storage_path, content_type, file_size_bytes, width, height, is_cover, sort_order, created_at"
    )
    .single();

  if (error || !media) {
    throw new Error(error?.message ?? "Failed to finalize media upload");
  }

  // Record in history
  await supabase.from("listing_media_history").insert({
    listing_media_id: media.id,
    listing_id: listingId,
    action: "uploaded",
    storage_path: storagePath,
  });

  const url = await getMediaUrl(supabase, storagePath);

  return mapMedia(media as Record<string, unknown>, url);
}

/* ------------------------------------------------------------------ */
/*  Read                                                               */
/* ------------------------------------------------------------------ */

export async function getListingMedia(
  supabase: SupabaseClient,
  listingId: string
): Promise<MediaDto[]> {
  const { data, error } = await supabase
    .from("listing_media")
    .select(
      "id, listing_id, storage_path, content_type, file_size_bytes, width, height, is_cover, sort_order, created_at"
    )
    .eq("listing_id", listingId)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return [];
  }

  const mediaItems = await Promise.all(
    data.map(async (row) => {
      const url = await getMediaUrl(supabase, row.storage_path as string, {
        width: 400,
        height: 300,
      });
      return mapMedia(row as Record<string, unknown>, url);
    })
  );

  return mediaItems;
}

/* ------------------------------------------------------------------ */
/*  Manage                                                             */
/* ------------------------------------------------------------------ */

export async function reorderMedia(
  supabase: SupabaseClient,
  listingId: string,
  orderedIds: string[]
): Promise<void> {
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("listing_media")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("listing_id", listingId)
  );

  await Promise.all(updates);
}

export async function setCover(
  supabase: SupabaseClient,
  listingId: string,
  mediaId: string
): Promise<void> {
  // Unset previous cover
  await supabase
    .from("listing_media")
    .update({ is_cover: false })
    .eq("listing_id", listingId)
    .eq("is_cover", true);

  // Set new cover
  const { error } = await supabase
    .from("listing_media")
    .update({ is_cover: true })
    .eq("id", mediaId)
    .eq("listing_id", listingId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteMedia(
  supabase: SupabaseClient,
  mediaId: string
): Promise<void> {
  // Fetch media record first
  const { data: media, error: fetchError } = await supabase
    .from("listing_media")
    .select("id, listing_id, storage_path")
    .eq("id", mediaId)
    .single();

  if (fetchError || !media) {
    throw new Error("Media not found");
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("listing-media")
    .remove([media.storage_path as string]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  // Delete from DB
  const { error: dbError } = await supabase
    .from("listing_media")
    .delete()
    .eq("id", mediaId);

  if (dbError) {
    throw new Error(dbError.message);
  }

  // Record in history
  await supabase.from("listing_media_history").insert({
    listing_media_id: media.id,
    listing_id: media.listing_id,
    action: "deleted",
    storage_path: media.storage_path,
  });
}

/* ------------------------------------------------------------------ */
/*  URL generation                                                     */
/* ------------------------------------------------------------------ */

export async function getMediaUrl(
  supabase: SupabaseClient,
  storagePath: string,
  transform?: { width?: number; height?: number }
): Promise<string> {
  const { data, error } = await supabase.storage
    .from("listing-media")
    .createSignedUrl(storagePath, 3600, {
      transform: transform
        ? {
            width: transform.width,
            height: transform.height,
            resize: "cover" as const,
          }
        : undefined,
    });

  if (error || !data) {
    return "";
  }

  return data.signedUrl;
}

/* ------------------------------------------------------------------ */
/*  Mapper                                                             */
/* ------------------------------------------------------------------ */

function mapMedia(row: Record<string, unknown>, url: string): MediaDto {
  return {
    id: row.id as string,
    listing_id: row.listing_id as string,
    storage_path: row.storage_path as string,
    content_type: row.content_type as string,
    file_size_bytes: row.file_size_bytes as number,
    width: (row.width as number) ?? null,
    height: (row.height as number) ?? null,
    is_cover: row.is_cover as boolean,
    sort_order: row.sort_order as number,
    created_at: row.created_at as string,
    url,
  };
}
