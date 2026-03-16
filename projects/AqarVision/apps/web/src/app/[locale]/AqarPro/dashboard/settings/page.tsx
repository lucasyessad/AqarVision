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
    redirect("/fr/AqarPro/auth/login");
  }

  const full_name = formData.get("full_name") as string | null;
  const phone = formData.get("phone") as string | null;
  const preferred_locale = formData.get("preferred_locale") as SupportedLocale | null;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
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
    redirect("/fr/AqarPro/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, preferred_locale")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-3xl space-y-1">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          {tDashboard("settings_title")}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {tDashboard("settings_subtitle")}
        </p>
      </div>

      {/* Email (read-only) */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[240px_1fr]">
          <div>
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              {tDashboard("email_label")}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {tDashboard("email_hint")}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
              <svg className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{user.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <form action={updateProfileAction}>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {/* Card header */}
          <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              {tDashboard("personal_info")}
            </h2>
          </div>

          {/* Full name row */}
          <div className="grid grid-cols-1 gap-6 border-b border-zinc-200 p-6 dark:border-zinc-800 md:grid-cols-[240px_1fr]">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-zinc-950 dark:text-zinc-50">
                {t("full_name")}
              </label>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {tDashboard("full_name_hint")}
              </p>
            </div>
            <div>
              <input
                id="full_name"
                type="text"
                name="full_name"
                defaultValue={profile?.full_name ?? ""}
                placeholder={tDashboard("full_name_placeholder")}
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 transition-shadow focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>

          {/* Phone row */}
          <div className="grid grid-cols-1 gap-6 border-b border-zinc-200 p-6 dark:border-zinc-800 md:grid-cols-[240px_1fr]">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-zinc-950 dark:text-zinc-50">
                {t("phone")}
              </label>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {tDashboard("phone_hint")}
              </p>
            </div>
            <div>
              <input
                id="phone"
                type="tel"
                name="phone"
                defaultValue={profile?.phone ?? ""}
                placeholder="+213 XX XX XX XX"
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 transition-shadow focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>

          {/* Language row */}
          <div className="grid grid-cols-1 gap-6 border-b border-zinc-200 p-6 dark:border-zinc-800 md:grid-cols-[240px_1fr]">
            <div>
              <label htmlFor="preferred_locale" className="block text-sm font-medium text-zinc-950 dark:text-zinc-50">
                {t("preferred_locale")}
              </label>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {tDashboard("locale_hint")}
              </p>
            </div>
            <div>
              <select
                id="preferred_locale"
                name="preferred_locale"
                defaultValue={profile?.preferred_locale ?? "fr"}
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              >
                {SUPPORTED_LOCALES.map((locale) => (
                  <option key={locale} value={locale}>
                    {tDashboard(`locale_${locale}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end bg-zinc-50 px-6 py-4 dark:bg-zinc-900/50">
            <button
              type="submit"
              className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 focus:outline-none"
            >
              {tDashboard("save")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
