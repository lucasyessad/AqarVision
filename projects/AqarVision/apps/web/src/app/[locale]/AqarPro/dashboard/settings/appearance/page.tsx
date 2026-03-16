import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getAgencyForCurrentUser,
  isAuthError,
} from "@/lib/actions/auth";
import { ThemeStudio } from "@/features/agency-settings/components/ThemeStudio";

export default async function AppearancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) {
    redirect(`/${locale}/AqarPro/auth/login`);
  }

  const supabase = await createClient();

  // Fetch agency branding + theme data
  const { data: agency } = await supabase
    .from("agencies")
    .select("theme, primary_color, accent_color, secondary_color, logo_url, cover_url, description, slug")
    .eq("id", auth.agencyId)
    .single();

  // Fetch current plan
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_id, plans(slug)")
    .eq("agency_id", auth.agencyId)
    .in("status", ["active", "trialing", "past_due"])
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const planCode: string = (subscription?.plans as any)?.slug ?? "enterprise";

  return (
    <div className="space-y-1">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Apparence
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Choisissez le thème, les couleurs et le branding de votre vitrine publique.
        </p>
      </div>

      <ThemeStudio
        currentTheme={agency?.theme ?? "modern"}
        currentPrimaryColor={agency?.primary_color ?? null}
        currentAccentColor={agency?.accent_color ?? null}
        currentSecondaryColor={agency?.secondary_color ?? null}
        currentLogoUrl={agency?.logo_url ?? null}
        currentCoverUrl={agency?.cover_url ?? null}
        agencyPlan={planCode}
        agencyName={auth.agencyName}
        agencySlug={agency?.slug ?? auth.agencySlug}
        agencyDescription={agency?.description ?? null}
      />
    </div>
  );
}
