"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withSuperAdminAuth } from "@/lib/auth/with-super-admin-auth";

export type SettingRow = {
  key: string;
  value: unknown;
  description: string | null;
  category: string;
};

const UpdateSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

const PackIdSchema = z.string().uuid();
const SubIdSchema = z.string().uuid();

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
  const parsed = UpdateSettingSchema.safeParse({
    key: formData.get("key"),
    value: formData.get("value"),
  });
  if (!parsed.success) return { success: false, error: "Données invalides" };

  const result = await withSuperAdminAuth(async ({ userId }) => {
    const supabase = await createClient();

    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(parsed.data.value);
    } catch {
      parsedValue = parsed.data.value;
    }

    const { error } = await supabase
      .from("platform_settings")
      .update({ value: parsedValue, updated_by: userId })
      .eq("key", parsed.data.key);

    if (error) throw new Error(error.message);
    revalidatePath("/admin/settings");
  });

  if (!result.success) return { success: false, error: result.error.message };
  return { success: true };
}

/** Validate a pending individual pack payment (manual providers) */
export async function confirmPackPaymentAction(
  packId: string
): Promise<{ success: boolean; error?: string }> {
  const parsed = PackIdSchema.safeParse(packId);
  if (!parsed.success) return { success: false, error: "ID invalide" };

  const result = await withSuperAdminAuth(async () => {
    const supabase = await createClient();
    const { error } = await supabase
      .from("individual_listing_packs")
      .update({ payment_status: "confirmed" })
      .eq("id", parsed.data);

    if (error) throw new Error(error.message);
    revalidatePath("/admin/payments");
  });

  if (!result.success) return { success: false, error: result.error.message };
  return { success: true };
}

/** Validate a pending individual subscription payment */
export async function confirmSubscriptionPaymentAction(
  subId: string
): Promise<{ success: boolean; error?: string }> {
  const parsed = SubIdSchema.safeParse(subId);
  if (!parsed.success) return { success: false, error: "ID invalide" };

  const result = await withSuperAdminAuth(async () => {
    const supabase = await createClient();
    const { error } = await supabase
      .from("individual_subscriptions")
      .update({ status: "active" })
      .eq("id", parsed.data);

    if (error) throw new Error(error.message);
    revalidatePath("/admin/payments");
  });

  if (!result.success) return { success: false, error: result.error.message };
  return { success: true };
}
