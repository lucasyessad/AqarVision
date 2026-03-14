"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCommunesForWilaya(
  wilayaCode: string
): Promise<{ id: number; name_fr: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("communes")
    .select("id, name_fr")
    .eq("wilaya_code", wilayaCode)
    .order("name_fr");
  return (data ?? []) as { id: number; name_fr: string }[];
}
