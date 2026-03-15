"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SettingRow = {
  key: string;
  value: unknown;
  description: string | null;
  category: string;
};

/** Fetch all platform settings grouped by category */
export async function getPlatformSettings(): Promise<Record<string, SettingRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("platform_settings")
    .select("key, value, description, category")
    .order("category")
    .order("key");

  if (error) throw new Error(error.message);

  const grouped: Record<string, SettingRow[]> = {};
  for (const row of data ?? []) {
    const cat = row.category as string;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat]!.push(row as SettingRow);
  }
  return grouped;
}

/** Update a single platform setting */
export async function updatePlatformSettingAction(
  _prev: { success: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const key = formData.get("key") as string;
  const rawValue = formData.get("value") as string;

  if (!key) return { success: false, error: "Clé manquante" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data: isAdmin } = await supabase.rpc("is_super_admin", { p_user_id: user.id });
  if (!isAdmin) return { success: false, error: "Accès refusé" };

  // Parse value: try JSON, fall back to string
  let parsedValue: unknown;
  try {
    parsedValue = JSON.parse(rawValue);
  } catch {
    parsedValue = rawValue;
  }

  const { error } = await supabase
    .from("platform_settings")
    .update({ value: parsedValue, updated_by: user.id })
    .eq("key", key);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/settings");
  return { success: true };
}

/** Validate a pending individual pack payment (manual providers) */
export async function confirmPackPaymentAction(
  packId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data: isAdmin } = await supabase.rpc("is_super_admin", { p_user_id: user.id });
  if (!isAdmin) return { success: false, error: "Accès refusé" };

  const { error } = await supabase
    .from("individual_listing_packs")
    .update({ payment_status: "confirmed" })
    .eq("id", packId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/payments");
  return { success: true };
}

/** Validate a pending individual subscription payment */
export async function confirmSubscriptionPaymentAction(
  subId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data: isAdmin } = await supabase.rpc("is_super_admin", { p_user_id: user.id });
  if (!isAdmin) return { success: false, error: "Accès refusé" };

  const { error } = await supabase
    .from("individual_subscriptions")
    .update({ status: "active" })
    .eq("id", subId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/payments");
  return { success: true };
}
