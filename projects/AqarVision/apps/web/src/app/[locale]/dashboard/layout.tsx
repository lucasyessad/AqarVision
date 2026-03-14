import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // getTranslations kept for onboarding banner
  await getTranslations("dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  // Fetch profile for display name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .single();

  // Fetch membership + agency slug
  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id, agencies(slug)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  const agencySlug = membership
    ? ((membership.agencies as unknown as { slug: string } | null)?.slug ?? null)
    : null;

  // Onboarding banner: show if agency has 0 listings
  let showOnboardingBanner = false;
  if (membership?.agency_id) {
    const { count } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", membership.agency_id);
    showOnboardingBanner = (count ?? 0) === 0;
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        agencySlug={agencySlug}
        userEmail={user.email ?? ""}
        fullName={profile?.full_name}
      />

      <div className="flex flex-1 flex-col">
        {/* Onboarding banner */}
        {showOnboardingBanner && (
          <div className="border-b border-gold/30 bg-gold/10 px-8 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Terminez la configuration de votre agence</span>{" "}
                — ajoutez votre logo, publiez votre première annonce et invitez votre équipe.
              </p>
              <Link
                href="/dashboard/onboarding"
                className="ms-4 flex-shrink-0 rounded-lg bg-gold px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
              >
                Commencer →
              </Link>
            </div>
          </div>
        )}
        <main className="flex-1 bg-off-white p-8">{children}</main>
      </div>
    </div>
  );
}
