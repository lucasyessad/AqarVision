import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

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

  // Individual users (no agency membership) must use AqarChaab
  if (!membership) {
    redirect(`/${locale}/AqarChaab/espace`);
  }

  const agencySlug = (membership.agencies as unknown as { slug: string } | null)?.slug ?? null;

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
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardShell
        agencySlug={agencySlug}
        userEmail={user.email ?? ""}
        fullName={profile?.full_name}
        locale={locale}
        pageTitle={t("nav.overview")}
      >
        {/* Onboarding banner */}
        {showOnboardingBanner && (
          <div className="border-b border-amber-200 bg-amber-50 px-8 py-3 dark:border-amber-800 dark:bg-amber-950">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {t("onboarding_banner.title")}
                </span>{" "}
                — {t("onboarding_banner.description")}
              </p>
              <Link
                href="/AqarPro/dashboard/onboarding"
                className="ms-4 flex-shrink-0 rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
              >
                {t("onboarding_banner.cta")}
              </Link>
            </div>
          </div>
        )}
        <main className="flex-1 bg-zinc-50 dark:bg-zinc-950 p-8">{children}</main>
      </DashboardShell>
    </div>
  );
}
