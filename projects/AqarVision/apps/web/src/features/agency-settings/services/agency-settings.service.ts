import type { SupabaseClient } from "@supabase/supabase-js";
import type { BrandingInput, StorefrontContentInput, NotificationPrefsInput } from "../schemas/agency-settings.schema";

export async function updateBranding(
  supabase: SupabaseClient,
  agencyId: string,
  input: BrandingInput
): Promise<void> {
  const { error } = await supabase
    .from("agencies")
    .update({
      theme: input.theme,
      branding: {
        primary_color: input.primary_color,
        accent_color: input.accent_color,
        secondary_color: input.secondary_color,
      },
    })
    .eq("id", agencyId);

  if (error) throw error;
}

export async function updateStorefrontContent(
  supabase: SupabaseClient,
  agencyId: string,
  content: StorefrontContentInput
): Promise<void> {
  const { error } = await supabase
    .from("agencies")
    .update({ storefront_content: content })
    .eq("id", agencyId);

  if (error) throw error;
}

export async function updateNotificationPrefs(
  supabase: SupabaseClient,
  agencyId: string,
  prefs: NotificationPrefsInput
): Promise<void> {
  const { error } = await supabase
    .from("agencies")
    .update({ notification_prefs: prefs })
    .eq("id", agencyId);

  if (error) throw error;
}

export async function uploadAgencyLogo(
  supabase: SupabaseClient,
  agencyId: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  const path = `agencies/${agencyId}/logo.${contentType.split("/")[1] ?? "png"}`;

  const { error } = await supabase.storage
    .from("agency-assets")
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("agency-assets")
    .getPublicUrl(path);

  await supabase
    .from("agencies")
    .update({ logo_url: urlData.publicUrl })
    .eq("id", agencyId);

  return urlData.publicUrl;
}
