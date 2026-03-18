import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getPlatformSettings } from "@/features/admin/services/admin.service";
import { PlatformSettingsEditor } from "@/features/admin/components/PlatformSettingsEditor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return { title: t("adminPlatformSettings") };
}

export default async function PlatformSettingsPage() {
  const t = await getTranslations("admin");
  const supabase = await createClient();

  const settings = await getPlatformSettings(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          {t("platformSettings")}
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {t("platformSettingsDescription")}
        </p>
      </div>
      <PlatformSettingsEditor initialSettings={settings} />
    </div>
  );
}
