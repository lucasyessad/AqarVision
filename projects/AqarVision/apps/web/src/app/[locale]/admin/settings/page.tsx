import React from "react";
import { getPlatformSettings } from "@/features/admin/actions/platform-settings.action";
import { SettingsForm } from "./SettingsForm";

const CATEGORY_LABELS: Record<string, string> = {
  quotas: "Quotas annonces",
  payments: "Paiements",
  packs: "Packs (tarifs)",
  subscriptions: "Abonnements (tarifs)",
  moderation: "Modération",
  platform: "Plateforme",
};

export default async function AdminSettingsPage() {
  const grouped = await getPlatformSettings();
  const categories = Object.keys(grouped).sort((a, b) => {
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
