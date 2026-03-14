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
          <Link
            href="/dashboard/settings"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            {t("nav.settings")}
          </Link>
        </nav>
        <UserMenu
          email={user.email ?? ""}
          fullName={profile?.full_name}
        />
      </aside>
      <main className="flex-1 bg-off-white p-8">{children}</main>
    </div>
  );
}
