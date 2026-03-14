import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SUPPORTED_LOCALES } from "@/features/auth/schemas/auth.schema";
import type { SupportedLocale } from "@/features/auth/schemas/auth.schema";

async function updateProfileAction(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const full_name = formData.get("full_name") as string | null;
  const phone = formData.get("phone") as string | null;
  const preferred_locale = formData.get("preferred_locale") as SupportedLocale | null;

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (full_name !== null) updates.full_name = full_name;
  if (phone !== null) updates.phone = phone;
  if (preferred_locale && SUPPORTED_LOCALES.includes(preferred_locale)) {
    updates.preferred_locale = preferred_locale;
  }

  await supabase.from("profiles").update(updates).eq("user_id", user.id);
}

export default async function SettingsPage() {
  const t = await getTranslations("auth");
  const tDashboard = await getTranslations("dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, preferred_locale")
    .eq("user_id", user.id)
    .single();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-blue-night">
        {t("settings")}
      </h1>
      <div className="max-w-lg rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-700">
          {t("profile")}
        </h2>
        <div className="mb-4 rounded-lg bg-gray-50 p-3">
          <p className="text-sm text-gray-500">{t("email")}</p>
          <p className="font-medium text-gray-700">{user.email}</p>
        </div>
        <form action={updateProfileAction} className="space-y-4">
          <div>
            <label
              htmlFor="full_name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {t("full_name")}
            </label>
            <input
              id="full_name"
              type="text"
              name="full_name"
              defaultValue={profile?.full_name ?? ""}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-night focus:outline-none focus:ring-2 focus:ring-blue-night/20"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {t("phone")}
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              defaultValue={profile?.phone ?? ""}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-night focus:outline-none focus:ring-2 focus:ring-blue-night/20"
            />
          </div>
          <div>
            <label
              htmlFor="preferred_locale"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {t("preferred_locale")}
            </label>
            <select
              id="preferred_locale"
              name="preferred_locale"
              defaultValue={profile?.preferred_locale ?? "fr"}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-night focus:outline-none focus:ring-2 focus:ring-blue-night/20"
            >
              {SUPPORTED_LOCALES.map((locale) => (
                <option key={locale} value={locale}>
                  {locale === "fr"
                    ? "Français"
                    : locale === "ar"
                      ? "العربية"
                      : locale === "en"
                        ? "English"
                        : "Español"}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-night px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-night/90"
          >
            {tDashboard("save")}
          </button>
        </form>
      </div>
    </div>
  );
}
