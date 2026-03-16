"use server";

import { createClient } from "@/lib/supabase/server";
import { withSuperAdminAuth } from "@/lib/auth/with-super-admin-auth";
import { revalidatePath } from "next/cache";
import { fail } from "@/types/action-result";
import type { ActionResult } from "@/types/action-result";

const EDITORIAL_KEYS = ["editorial_hero_url", "editorial_split_url", "editorial_fullbleed_url"] as const;
type EditorialKey = (typeof EDITORIAL_KEYS)[number];

function isEditorialKey(key: string): key is EditorialKey {
  return EDITORIAL_KEYS.includes(key as EditorialKey);
}

/** Step 1 — Generate a signed upload URL for the editorial bucket */
export async function getEditorialUploadUrlAction(
  key: string,
  fileName: string
): Promise<ActionResult<{ signed_url: string; path: string }>> {
  if (!isEditorialKey(key)) {
    return fail("INVALID_KEY", "Clé invalide");
  }

  return withSuperAdminAuth(async () => {
    const supabase = await createClient();
    const ext = fileName.split(".").pop() ?? "jpg";
    const path = `${key}-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("editorial")
      .createSignedUploadUrl(path);

    if (error || !data) {
      throw new Error(error?.message ?? "Impossible de générer l'URL d'upload");
    }

    return { signed_url: data.signedUrl, path };
  });
}

/** Step 2 — Save the public URL to platform_settings after upload */
export async function saveEditorialPhotoAction(
  key: string,
  path: string
): Promise<ActionResult<{ url: string }>> {
  if (!isEditorialKey(key)) {
    return fail("INVALID_KEY", "Clé invalide");
  }

  return withSuperAdminAuth(async () => {
    const supabase = await createClient();

    const { data: { publicUrl } } = supabase.storage
      .from("editorial")
      .getPublicUrl(path);

    const { error } = await supabase
      .from("platform_settings")
      .update({
        value: JSON.stringify(publicUrl),
        updated_at: new Date().toISOString(),
      })
      .eq("key", key);

    if (error) throw new Error(error.message);

    // Revalidate homepage in all locales
    revalidatePath("/[locale]", "page");

    return { url: publicUrl };
  });
}
