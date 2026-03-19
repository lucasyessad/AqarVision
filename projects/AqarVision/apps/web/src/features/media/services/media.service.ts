import type { SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";

const MAX_SIZE = 2400;
const THUMB_WIDTH = 400;
const THUMB_HEIGHT = 300;
const QUALITY = 85;
const THUMB_QUALITY = 75;

export async function processAndUploadImage(
  supabase: SupabaseClient,
  file: Buffer,
  listingId: string,
  position: number,
  isCover: boolean
): Promise<{
  storagePath: string;
  width: number;
  height: number;
  fileSize: number;
}> {
  // Process with Sharp
  const image = sharp(file).rotate(); // Auto-correct EXIF orientation
  const metadata = await image.metadata();

  let width = metadata.width ?? MAX_SIZE;
  let height = metadata.height ?? MAX_SIZE;

  // Resize if larger than max
  if (width > MAX_SIZE || height > MAX_SIZE) {
    if (width > height) {
      height = Math.round(height * (MAX_SIZE / width));
      width = MAX_SIZE;
    } else {
      width = Math.round(width * (MAX_SIZE / height));
      height = MAX_SIZE;
    }
  }

  const processed = await image
    .resize(width, height, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .withMetadata({ orientation: undefined }) // Strip EXIF
    .toBuffer();

  // Generate thumbnail
  const thumbnail = await sharp(file)
    .rotate()
    .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: "cover" })
    .webp({ quality: THUMB_QUALITY })
    .toBuffer();

  const timestamp = Date.now();
  const basePath = `listings/${listingId}`;
  const originalPath = `${basePath}/${timestamp}_original.webp`;
  const thumbPath = `${basePath}/${timestamp}_thumb.webp`;

  // Upload to Supabase Storage
  const [originalUpload, thumbUpload] = await Promise.all([
    supabase.storage.from("listing-media").upload(originalPath, processed, {
      contentType: "image/webp",
      upsert: false,
    }),
    supabase.storage.from("listing-media").upload(thumbPath, thumbnail, {
      contentType: "image/webp",
      upsert: false,
    }),
  ]);

  if (originalUpload.error) throw originalUpload.error;
  if (thumbUpload.error) throw thumbUpload.error;

  // Save to listing_media table
  const { error } = await supabase.from("listing_media").insert({
    listing_id: listingId,
    storage_path: originalPath,
    content_type: "image/webp",
    width,
    height,
    file_size_bytes: processed.byteLength,
    position,
    is_cover: isCover,
  });

  if (error) throw error;

  return {
    storagePath: originalPath,
    width,
    height,
    fileSize: processed.byteLength,
  };
}

export function getImageUrl(
  supabaseUrl: string,
  storagePath: string,
  options?: { width?: number; height?: number; quality?: number }
): string {
  const base = `${supabaseUrl}/storage/v1/object/public/listing-media/${storagePath}`;
  if (!options) return base;

  const params = new URLSearchParams();
  if (options.width) params.set("width", String(options.width));
  if (options.height) params.set("height", String(options.height));
  params.set("resize", "cover");
  params.set("quality", String(options.quality ?? 80));

  return `${base}?${params.toString()}`;
}

export async function extractVideoMetadata(
  url: string
): Promise<{ thumbnailUrl: string; title: string; provider: "youtube" | "vimeo" } | null> {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);

  if (youtubeMatch) {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { thumbnail_url: string; title: string };
    return {
      thumbnailUrl: data.thumbnail_url,
      title: data.title,
      provider: "youtube",
    };
  }

  if (vimeoMatch) {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { thumbnail_url: string; title: string };
    return {
      thumbnailUrl: data.thumbnail_url,
      title: data.title,
      provider: "vimeo",
    };
  }

  return null;
}
