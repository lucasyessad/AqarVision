"use server";

import { createClient } from "@/lib/supabase/server";
import type { Wilaya, Commune } from "./types";

export async function getWilayas(): Promise<Wilaya[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wilayas")
    .select("code, name_fr, name_ar, name_en")
    .order("code");

  return (data ?? []) as Wilaya[];
}

export async function getCommunes(wilayaCode?: string): Promise<Commune[]> {
  const supabase = await createClient();

  let query = supabase
    .from("communes")
    .select("id, wilaya_code, name_fr, name_ar, name_en")
    .order("name_fr");

  if (wilayaCode) {
    query = query.eq("wilaya_code", wilayaCode);
  }

  const { data } = await query;
  return (data ?? []) as Commune[];
}
