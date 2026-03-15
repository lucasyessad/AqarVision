"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAgencyForCurrentUser, isAuthError } from "@/lib/actions/auth";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import type { ActionResult } from "@/features/agencies/types/agency.types";

const BUCKET = "agency-media";
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_LOGO_BYTES = 500 * 1024;      // 500 Ko
const MAX_COVER_BYTES = 2 * 1024 * 1024; // 2 Mo

export type BrandingType = "logo" | "cover";

export interface BrandingUploadResult {
  url: string;
  type: BrandingType;
}

export async function uploadBrandingAction(
  _prevState: ActionResult<BrandingUploadResult> | null,
  formData: FormData
): Promise<ActionResult<BrandingUploadResult>> {
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as BrandingType | null;

  // Validate inputs
  if (!file || file.size === 0) {
    return { success: false, error: { code: "NO_FILE", message: "Aucun fichier sélectionné." } };
  }
  if (type !== "logo" && type !== "cover") {
    return { success: false, error: { code: "INVALID_TYPE", message: "Type d'image invalide." } };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: { code: "INVALID_FORMAT", message: "Format non supporté. Utilisez PNG, JPEG ou WebP." } };
  }
  const maxBytes = type === "logo" ? MAX_LOGO_BYTES : MAX_COVER_BYTES;
  if (file.size > maxBytes) {
    const label = type === "logo" ? "500 Ko" : "2 Mo";
    return { success: false, error: { code: "TOO_LARGE", message: `Fichier trop volumineux. Maximum : ${label}.` } };
  }

  // Resolve agency context to obtain agencyId and agencySlug
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) {
    return { success: false, error: { code: auth.code, message: auth.message } };
  }

  const agencyId = auth.agencyId;
  const agencySlug = auth.agencySlug;

  // Read file buffer before entering the handler (File is not serializable across async boundaries)
  const arrayBuffer = await file.arrayBuffer();
  const ext = (file.type.split("/")[1] ?? "jpg").replace("jpeg", "jpg");
  const storagePath = `agencies/${agencyId}/${type}.${ext}`;

  return withAgencyAuth(agencyId, "settings", "update", async () => {
    const supabase = await createClient();

    // Upload (upsert=true overwrites existing file)
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      // Bucket might not exist yet
      if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("not found")) {
        const err = new Error(`Le bucket "${BUCKET}" n'existe pas encore dans Supabase Storage. Créez-le dans le dashboard Supabase.`);
        err.name = "BUCKET_NOT_FOUND";
        throw err;
      }
      const err = new Error(uploadError.message);
      err.name = "UPLOAD_ERROR";
      throw err;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    // Update agency record
    const column = type === "logo" ? "logo_url" : "cover_url";
    const { error: updateError } = await supabase
      .from("agencies")
      .update({ [column]: publicUrl })
      .eq("id", agencyId);

    if (updateError) {
      const err = new Error(updateError.message);
      err.name = "DB_ERROR";
      throw err;
    }

    // Revalidate branding page + storefront
    revalidatePath("/AqarPro/dashboard/settings/branding");
    revalidatePath(`/a/${agencySlug}`);

    return { url: publicUrl, type };
  });
}
