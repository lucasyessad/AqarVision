import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getAgencyForCurrentUser,
  isAuthError,
} from "@/lib/actions/auth";
import { OnboardingWizard } from "@/features/onboarding/components/OnboardingWizard";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) {
    redirect(`/${locale}/auth/login`);
  }

  const supabase = await createClient();

  // Fetch agency details for prefill
  const { data: agency } = await supabase
    .from("agencies")
    .select("name, phone, description")
    .eq("id", auth.agencyId)
    .single();

  // Fetch wilaya from first branch (if any)
  const { data: branch } = await supabase
    .from("agency_branches")
    .select("wilaya_code")
    .eq("agency_id", auth.agencyId)
    .limit(1)
    .maybeSingle();

  // Count listings to check if onboarding should still show
  const { count: listingsCount } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("agency_id", auth.agencyId);

  // Count active members (excluding owner)
  const { count: membersCount } = await supabase
    .from("agency_memberships")
    .select("id", { count: "exact", head: true })
    .eq("agency_id", auth.agencyId)
    .eq("is_active", true)
    .neq("role", "owner");

  // If agency already has listings AND members → redirect to dashboard
  // (Onboarding is complete)
  if ((listingsCount ?? 0) > 0 && (membersCount ?? 0) > 0) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="px-4 py-8">
      <OnboardingWizard
        agencyId={auth.agencyId}
        agencyName={agency?.name ?? auth.agencyName}
        agencyPhone={agency?.phone ?? null}
        agencyWilaya={branch?.wilaya_code ?? null}
        locale={locale}
      />
    </div>
  );
}
