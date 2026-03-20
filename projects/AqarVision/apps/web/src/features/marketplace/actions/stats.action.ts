"use server";

import { createClient } from "@/lib/supabase/server";

export interface HomepageStat {
  value: number;
  suffix: string;
  labelKey: string;
}

export async function getHomepageStats(): Promise<HomepageStat[]> {
  const supabase = await createClient();

  const [listings, agencies, users, wilayasRes, views] = await Promise.all([
    supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("current_status", "published"),
    supabase
      .from("agencies")
      .select("*", { count: "exact", head: true })
      .eq("is_verified", true),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("listings")
      .select("wilaya_code")
      .eq("current_status", "published"),
    supabase
      .from("listing_views")
      .select("*", { count: "exact", head: true }),
  ]);

  const distinctWilayas = new Set(
    (wilayasRes.data ?? []).map((r: { wilaya_code: string }) => r.wilaya_code)
  ).size;

  return [
    { value: listings.count ?? 0,  suffix: "+", labelKey: "statsStrip.listings" },
    { value: agencies.count ?? 0,  suffix: "",  labelKey: "statsStrip.verifiedAgencies" },
    { value: users.count ?? 0,     suffix: "+", labelKey: "statsStrip.users" },
    { value: distinctWilayas,      suffix: "",  labelKey: "statsStrip.wilayas" },
    { value: views.count ?? 0,     suffix: "+", labelKey: "statsStrip.totalViews" },
  ];
}
