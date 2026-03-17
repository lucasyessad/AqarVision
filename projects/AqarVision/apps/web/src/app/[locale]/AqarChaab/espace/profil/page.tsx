import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

interface ProfilPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ProfilPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "espace" });
  return { title: t("nav.profil") };
}

export default async function ProfilPage({ params }: ProfilPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "espace" });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, preferred_locale, avatar_url")
    .eq("user_id", user!.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t("nav.profil")}</h1>

      <div className="rounded-xl border border-gray-100 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        {/* Avatar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900/10 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {(profile?.full_name ?? user!.email ?? "?")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">
              {profile?.full_name ?? t("profil_no_name")}
            </p>
            <p className="text-sm text-gray-400">{user!.email}</p>
          </div>
        </div>

        {/* Info fields */}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-400">
              {t("profil_email")}
            </label>
            <p className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200">
              {user!.email}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-400">
              {t("profil_name")}
            </label>
            <p className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200">
              {profile?.full_name ?? <span className="italic text-gray-400">{t("profil_not_set")}</span>}
            </p>
          </div>

          {profile?.phone && (
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-400">
                {t("profil_phone")}
              </label>
              <p className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200">
                {profile.phone}
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          {t("profil_edit_coming_soon")}
        </p>
      </div>
    </div>
  );
}
