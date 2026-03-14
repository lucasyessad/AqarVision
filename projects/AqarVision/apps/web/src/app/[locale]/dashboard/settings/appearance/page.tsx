import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getAgencyForCurrentUser,
  isAuthError,
} from "@/lib/actions/auth";
import { ThemePicker } from "@/features/agency-settings/components/ThemePicker";

export default async function AppearancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 1. Resolve agency context
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) {
    redirect(`/${locale}/auth/login`);
  }

  // 2. Fetch agency theme data
  const supabase = await createClient();
  const { data: agency } = await supabase
    .from("agencies")
    .select("theme, primary_color, accent_color, secondary_color")
    .eq("id", auth.agencyId)
    .single();

  // 3. Fetch current plan
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_id, plans(code)")
    .eq("agency_id", auth.agencyId)
    .eq("status", "active")
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const planCode: string = (subscription?.plans as any)?.code ?? "starter";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-night">Apparence</h1>
        <p className="mt-1 text-sm text-gray-500">
          Personnalisez le thème et les couleurs de votre vitrine publique.
        </p>
      </div>

      <ThemePicker
        currentTheme={agency?.theme ?? "modern"}
        currentPrimaryColor={agency?.primary_color ?? null}
        currentAccentColor={agency?.accent_color ?? null}
        currentSecondaryColor={agency?.secondary_color ?? null}
        agencyPlan={planCode}
      />
    </div>
  );
}
