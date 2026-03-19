import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { EntitlementEditor } from "@/features/admin/components/EntitlementEditor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return { title: t("adminEntitlements") };
}

export default async function EntitlementsPage() {
  const t = await getTranslations("admin");
  const supabase = await createClient();

  // Fetch agencies for the selector
  const { data: agencies } = await supabase
    .from("agencies")
    .select("id, name, slug")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {t("entitlements")}
      </h1>
      <EntitlementEditor agencies={agencies ?? []} />
    </div>
  );
}
