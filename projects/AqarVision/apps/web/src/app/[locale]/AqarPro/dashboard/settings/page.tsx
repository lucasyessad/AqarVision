import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/auth/get-cached-user";
import { getAgencyForUser } from "@/lib/auth/get-agency-for-user";
import { SettingsClient } from "./settings-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("settings") };
}

export default async function SettingsPage() {
  const t = await getTranslations("nav");

  const user = await getCachedUser();
  if (!user) redirect("/auth/login");

  const supabase = await createClient();
  const agencyCtx = await getAgencyForUser(user.id);
  if (!agencyCtx) redirect("/AqarPro/dashboard");

  // Fetch agency data for settings
  const { data: agency } = await supabase
    .from("agencies")
    .select("*")
    .eq("id", agencyCtx.agencyId)
    .single();

  if (!agency) redirect("/AqarPro/dashboard");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {t("settings")}
      </h1>

      <SettingsClient
        agencyId={agencyCtx.agencyId}
        agency={{
          name: agency.name as string,
          description: agency.description as string | null,
          email: agency.email as string,
          phone: agency.phone as string,
          whatsapp_phone: agency.whatsapp_phone as string | null,
          opening_hours: agency.opening_hours as string | null,
          facebook_url: agency.facebook_url as string | null,
          instagram_url: agency.instagram_url as string | null,
          theme: agency.theme as string,
          branding: agency.branding as Record<string, string> | null,
          storefront_content: agency.storefront_content as Record<string, unknown> | null,
          notification_prefs: agency.notification_prefs as Record<string, boolean> | null,
        }}
      />
    </div>
  );
}
