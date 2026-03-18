"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ThemeStudio } from "@/features/agency-settings/components/ThemeStudio";

interface AgencyData {
  name: string;
  description: string | null;
  email: string;
  phone: string;
  whatsapp_phone: string | null;
  opening_hours: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  theme: string;
  branding: Record<string, string> | null;
  storefront_content: Record<string, unknown> | null;
  notification_prefs: Record<string, boolean> | null;
}

interface Props {
  agencyId: string;
  agency: AgencyData;
}

type TabKey = "general" | "appearance" | "verification" | "notifications";

export function SettingsClient({ agencyId, agency }: Props) {
  const t = useTranslations("dashboard.settings");
  const tCommon = useTranslations("common.buttons");
  const [activeTab, setActiveTab] = useState<TabKey>("general");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "general", label: t("tabs.general") },
    { key: "appearance", label: t("tabs.appearance") },
    { key: "verification", label: t("tabs.verification") },
    { key: "notifications", label: t("tabs.notifications") },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-stone-200 dark:border-stone-700">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-fast",
                activeTab === tab.key
                  ? "border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400"
                  : "border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "general" && (
        <div className="max-w-lg space-y-4">
          <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6 space-y-4">
            <Input label={t("fields.name")} defaultValue={agency.name} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                {t("fields.description")}
              </label>
              <textarea
                defaultValue={agency.description ?? ""}
                rows={4}
                className={cn(
                  "w-full rounded-md border border-stone-300 dark:border-stone-600",
                  "bg-white dark:bg-stone-950 px-3 py-2 text-sm",
                  "text-stone-900 dark:text-stone-100",
                  "placeholder:text-stone-400 dark:placeholder:text-stone-500",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-950",
                  "resize-none"
                )}
              />
            </div>
            <Input label={t("fields.email")} type="email" defaultValue={agency.email} />
            <Input label={t("fields.phone")} type="tel" defaultValue={agency.phone} />
            <Input label="WhatsApp" type="tel" defaultValue={agency.whatsapp_phone ?? ""} />
            <Input label={t("fields.hours")} defaultValue={agency.opening_hours ?? ""} />
            <Input label="Facebook" type="url" defaultValue={agency.facebook_url ?? ""} />
            <Input label="Instagram" type="url" defaultValue={agency.instagram_url ?? ""} />
            <Button variant="primary" size="md">{tCommon("save")}</Button>
          </div>
        </div>
      )}

      {activeTab === "appearance" && (
        <ThemeStudio
          agency={{
            id: agencyId,
            name: agency.name,
            description: agency.description,
            phone: agency.phone,
            whatsapp_phone: agency.whatsapp_phone,
            email: agency.email,
            logo_url: null,
            opening_hours: agency.opening_hours,
            theme: agency.theme,
            branding: agency.branding as { primary_color?: string; accent_color?: string; secondary_color?: string } | null,
            storefront_content: agency.storefront_content as import("@/features/agency-settings/schemas/agency-settings.schema").StorefrontContentInput | null,
          }}
          onUploadImage={async () => ""}
        />
      )}

      {activeTab === "verification" && (
        <div className="max-w-lg">
          <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6 space-y-4">
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {t("verification.description")}
            </p>
            <Input label={t("verification.legalName")} />
            <Input label={t("verification.rcNumber")} />
            <Button variant="primary" size="md">{tCommon("submit")}</Button>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="max-w-lg">
          <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6 space-y-4">
            {[
              "newLead",
              "visitRequest",
              "newMessage",
              "moderationResult",
              "billingAlert",
              "weeklyDigest",
            ].map((key) => (
              <label
                key={key}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-stone-700 dark:text-stone-300">
                  {t(`notifications.${key}`)}
                </span>
                <input
                  type="checkbox"
                  defaultChecked={agency.notification_prefs?.[key] ?? true}
                  className="h-4 w-4 rounded border-stone-300 dark:border-stone-600 text-teal-600 focus:ring-teal-500"
                />
              </label>
            ))}
            <Button variant="primary" size="md">{tCommon("save")}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
