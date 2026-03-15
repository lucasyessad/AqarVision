import React from "react";
import { getPlatformSettings } from "@/features/admin/actions/platform-settings.action";
import { SettingsForm } from "./SettingsForm";
import { EditorialPhotosCard } from "./EditorialPhotosCard";
import { createClient } from "@/lib/supabase/server";

const CATEGORY_LABELS: Record<string, string> = {
  quotas: "Quotas annonces",
  payments: "Paiements",
  packs: "Packs (tarifs)",
  subscriptions: "Abonnements (tarifs)",
  moderation: "Modération",
  platform: "Plateforme",
};

const EDITORIAL_SLOTS = [
  {
    key: "editorial_hero_url",
    label: "Photo Hero",
    hint: "Fond du hero homepage — 1600×900, plein écran",
  },
  {
    key: "editorial_split_url",
    label: "Photo Split",
    hint: "Section éditorial droite — 900×700",
  },
  {
    key: "editorial_fullbleed_url",
    label: 'Photo "Chaque quartier"',
    hint: "Section full-bleed — 1400×700",
  },
];

export default async function AdminSettingsPage() {
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
    ...slot,
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
        <h1 className="text-2xl font-bold text-white">Paramètres plateforme</h1>
        <p className="mt-1 text-sm text-white/50">
          Configuration globale du site — modifiée en temps réel.
        </p>
      </div>

      <div className="space-y-8">
        {/* Photos éditoriales — section en premier */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
            Photos homepage
          </h2>
          <EditorialPhotosCard slots={slotsWithUrls} />
        </section>

        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
              {CATEGORY_LABELS[cat] ?? cat}
            </h2>
            <div
              className="divide-y rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
            >
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
