import React from "react";
import { getTranslations } from "next-intl/server";
import { getPlatformSettings } from "@/features/admin/actions/platform-settings.action";
import { SettingsForm } from "./SettingsForm";
import { EditorialPhotosCard } from "./EditorialPhotosCard";
import { createClient } from "@/lib/supabase/server";

const EDITORIAL_SLOTS = [
  {
    key: "editorial_hero_url",
    labelKey: "editorial_hero_label",
    hintKey: "editorial_hero_hint",
  },
  {
    key: "editorial_split_url",
    labelKey: "editorial_split_label",
    hintKey: "editorial_split_hint",
  },
  {
    key: "editorial_fullbleed_url",
    labelKey: "editorial_fullbleed_label",
    hintKey: "editorial_fullbleed_hint",
  },
];

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  quotas: "category_quotas",
  payments: "category_payments",
  packs: "category_packs",
  subscriptions: "category_subscriptions",
  moderation: "category_moderation",
  platform: "category_platform",
};

export default async function AdminSettingsPage() {
  const t = await getTranslations("admin");
  const supabase = await createClient();

  const [grouped, { data: editorialRows }] = await Promise.all([
    getPlatformSettings(),
    supabase
      .from("platform_settings")
      .select("key, value")
      .in("key", EDITORIAL_SLOTS.map((s) => s.key)),
  ]);

  const editorialUrls = Object.fromEntries(
    (editorialRows ?? []).map((r) => [
      r.key,
      typeof r.value === "string" && r.value !== "null" ? r.value : null,
    ])
  );

  const slotsWithUrls = EDITORIAL_SLOTS.map((slot) => ({
    key: slot.key,
    label: t(slot.labelKey as "editorial_hero_label" | "editorial_split_label" | "editorial_fullbleed_label"),
    hint: t(slot.hintKey as "editorial_hero_hint" | "editorial_split_hint" | "editorial_fullbleed_hint"),
    currentUrl: (editorialUrls[slot.key] as string | null) ?? null,
  }));

  const categories = Object.keys(grouped)
    .filter((c) => c !== "editorial")
    .sort((a, b) => {
      const order = ["platform", "payments", "quotas", "packs", "subscriptions", "moderation"];
      return (order.indexOf(a) ?? 99) - (order.indexOf(b) ?? 99);
    });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white dark:text-zinc-50">{t("settings_title")}</h1>
        <p className="mt-1 text-sm text-white/50 dark:text-zinc-400">
          {t("settings_subtitle")}
        </p>
      </div>

      <div className="space-y-8">
        {/* Photos editoriales */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40 dark:text-zinc-500">
            {t("settings_photos_title")}
          </h2>
          <EditorialPhotosCard slots={slotsWithUrls} />
        </section>

        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40 dark:text-zinc-500">
              {CATEGORY_LABEL_KEYS[cat] ? t(CATEGORY_LABEL_KEYS[cat] as "category_quotas" | "category_payments" | "category_packs" | "category_subscriptions" | "category_moderation" | "category_platform") : cat}
            </h2>
            <div className="divide-y divide-white/[0.06] dark:divide-zinc-700 rounded-xl bg-white/[0.04] dark:bg-zinc-800/50">
              {grouped[cat]!.map((setting) => (
                <SettingsForm key={setting.key} setting={setting} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
