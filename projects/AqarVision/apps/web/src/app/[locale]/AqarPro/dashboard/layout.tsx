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
    redirect(`/${locale}/AqarPro/auth/login`);
  }

  // Fetch profile and membership in parallel
  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("user_id", user.id).single(),
    supabase
      .from("agency_memberships")
      .select("agency_id, agencies(slug)")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
  ]);

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
          <div
            className="border-b px-8 py-3"
            style={{ borderColor: "var(--amber-glow)", background: "var(--warning-ghost)" }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                <span className="font-semibold" style={{ color: "var(--amber)" }}>
                  Terminez la configuration de votre agence
                </span>{" "}
                — ajoutez votre logo, publiez votre première annonce et invitez votre équipe.
              </p>
              <Link
                href="/AqarPro/dashboard/onboarding"
                className="ms-4 flex-shrink-0 rounded-lg px-4 py-1.5 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "var(--amber)", color: "var(--text-inverse)" }}
              >
                Commencer →
              </Link>
            </div>
          </div>
        )}
        <main className="flex-1 p-8" style={{ background: "var(--bg-primary)" }}>{children}</main>
      </div>
    </div>
  );
}
