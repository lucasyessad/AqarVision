import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/features/auth/components";
import { AgencySelector } from "@/features/agencies/components";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("dashboard");

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

  // Onboarding banner: show if agency has 0 listings
  let showOnboardingBanner = false;
  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (membership?.agency_id) {
    const { count } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", membership.agency_id);
    showOnboardingBanner = (count ?? 0) === 0;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-e border-gray-200 bg-blue-night text-white">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gold">AqarPro</h2>
        </div>
        <AgencySelector />
        <nav className="flex-1 space-y-1 px-3">
          <Link
            href="/dashboard"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            {t("nav.overview")}
          </Link>
          <Link
            href="/dashboard/listings"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            {t("nav.listings")}
          </Link>
          <Link
            href="/dashboard/leads"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            {t("nav.leads")}
          </Link>
          <Link
            href="/dashboard/visit-requests"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            {t("nav.visit_requests")}
          </Link>
          <Link
            href="/dashboard/analytics"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            {t("nav.analytics")}
          </Link>
          <Link
            href="/dashboard/ai"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            {t("nav.ai")}
          </Link>
          <Link
            href="/dashboard/team"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            {t("nav.team")}
          </Link>
          <Link
            href="/dashboard/billing"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            {t("nav.billing")}
          </Link>

          {/* Settings group */}
          <div className="pt-2">
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-white/40">
              Paramètres
            </p>
            <Link
              href="/dashboard/settings"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              {t("nav.settings")}
            </Link>
            <Link
              href="/dashboard/settings/appearance"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              Apparence
            </Link>
            <Link
              href="/dashboard/settings/branding"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              Branding
            </Link>
            <Link
              href="/dashboard/settings/verification"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              Vérification
            </Link>
          </div>
        </nav>
        <UserMenu
          email={user.email ?? ""}
          fullName={profile?.full_name}
        />
      </aside>

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
