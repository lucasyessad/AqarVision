import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AlertesClient } from "./AlertesClient";

interface AlertesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AlertesPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "espace" });
  return { title: t("nav.alertes") };
}

export default async function AlertesPage({ params }: AlertesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/AqarChaab/auth/login`);
  }

  // Fetch all saved searches for this user
  const { data: allSaved } = await supabase
    .from("saved_searches")
    .select("id, name, filters, notify, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (allSaved ?? []) as Array<{
    id: string;
    name: string;
    filters: Record<string, unknown>;
    notify: boolean;
    created_at: string;
    updated_at: string;
  }>;

  const alerts = rows.filter((r) => r.notify);
  const savedSearches = rows.filter((r) => !r.notify);

  return (
    <AlertesClient
      alerts={alerts}
      savedSearches={savedSearches}
      locale={locale}
    />
  );
}
