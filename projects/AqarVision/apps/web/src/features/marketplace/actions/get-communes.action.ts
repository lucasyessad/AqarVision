"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const WilayaCodeSchema = z.string().min(1).max(10);

export async function getCommunesForWilaya(
  wilayaCode: string
): Promise<{ id: number; name_fr: string }[]> {
  const parsed = WilayaCodeSchema.safeParse(wilayaCode);
  if (!parsed.success) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("communes")
    .select("id, name_fr")
    .eq("wilaya_code", parsed.data)
    .order("name_fr");
  return (data ?? []) as { id: number; name_fr: string }[];
}
