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
        <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal-950)" }}>
          Paramètres du compte
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--charcoal-500)" }}>
          Gérez vos informations personnelles et vos préférences.
        </p>
      </div>

      {/* ── Email (read-only) ─────────────────────────────────────── */}
      <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[240px_1fr]">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
              Adresse e-mail
            </h3>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--charcoal-500)" }}>
              Votre adresse de connexion. Contactez le support pour la modifier.
            </p>
          </div>
          <div>
            <div
              className="flex items-center gap-3 rounded-md border px-3 py-2.5"
              style={{ background: "#F6F9FC", borderColor: "#E3E8EF" }}
            >
              <svg className="h-4 w-4 shrink-0" style={{ color: "var(--charcoal-400)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <span className="text-sm" style={{ color: "var(--charcoal-700)" }}>{user.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Profile form ──────────────────────────────────────────── */}
      <form action={updateProfileAction}>
        <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
          {/* Card header */}
          <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
              Informations personnelles
            </h2>
          </div>

          {/* Full name row */}
          <div className="grid grid-cols-1 gap-6 border-b p-6 md:grid-cols-[240px_1fr]" style={{ borderColor: "#E3E8EF" }}>
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium" style={{ color: "var(--charcoal-950)" }}>
                {t("full_name")}
              </label>
              <p className="mt-1 text-xs" style={{ color: "var(--charcoal-500)" }}>
                Affiché sur votre profil et dans les communications.
              </p>
            </div>
            <div>
              <input
                id="full_name"
                type="text"
                name="full_name"
                defaultValue={profile?.full_name ?? ""}
                placeholder="Votre nom complet"
                className="w-full rounded-md border px-3 py-2 text-sm transition-shadow focus:outline-none focus:border-[var(--coral)] focus:ring-2 focus:ring-[rgba(232,114,92,0.1)]"
                style={{ borderColor: "#E3E8EF", color: "var(--charcoal-950)" }}
              />
            </div>
          </div>

          {/* Phone row */}
          <div className="grid grid-cols-1 gap-6 border-b p-6 md:grid-cols-[240px_1fr]" style={{ borderColor: "#E3E8EF" }}>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium" style={{ color: "var(--charcoal-950)" }}>
                {t("phone")}
              </label>
              <p className="mt-1 text-xs" style={{ color: "var(--charcoal-500)" }}>
                Numéro de contact (optionnel).
              </p>
            </div>
            <div>
              <input
                id="phone"
                type="tel"
                name="phone"
                defaultValue={profile?.phone ?? ""}
                placeholder="+213 XX XX XX XX"
                className="w-full rounded-md border px-3 py-2 text-sm transition-shadow focus:outline-none focus:border-[var(--coral)] focus:ring-2 focus:ring-[rgba(232,114,92,0.1)]"
                style={{ borderColor: "#E3E8EF", color: "var(--charcoal-950)" }}
              />
            </div>
          </div>

          {/* Language row */}
          <div className="grid grid-cols-1 gap-6 border-b p-6 md:grid-cols-[240px_1fr]" style={{ borderColor: "#E3E8EF" }}>
            <div>
              <label htmlFor="preferred_locale" className="block text-sm font-medium" style={{ color: "var(--charcoal-950)" }}>
                {t("preferred_locale")}
              </label>
              <p className="mt-1 text-xs" style={{ color: "var(--charcoal-500)" }}>
                Langue de l&apos;interface du dashboard.
              </p>
            </div>
            <div>
              <select
                id="preferred_locale"
                name="preferred_locale"
                defaultValue={profile?.preferred_locale ?? "fr"}
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: "#E3E8EF", color: "var(--charcoal-950)" }}
              >
                {SUPPORTED_LOCALES.map((locale) => (
                  <option key={locale} value={locale}>
                    {locale === "fr" ? "Français" : locale === "ar" ? "العربية" : locale === "en" ? "English" : "Español"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-4" style={{ background: "#F6F9FC" }}>
            <button
              type="submit"
              className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 focus:outline-none"
              style={{ background: "var(--coral)" }}
            >
              {tDashboard("save")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
