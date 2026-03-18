"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Save,
  Check,
  AlertCircle,
  Building2,
  Users,
  CreditCard,
  Package,
  Shield,
  Settings,
} from "lucide-react";
import { updatePlatformSettingAction } from "../actions/admin.action";
import type { PlatformSetting } from "../types/admin.types";

interface PlatformSettingsEditorProps {
  initialSettings: PlatformSetting[];
}

interface SettingField {
  key: string;
  label: string;
  type: "text" | "number" | "toggle" | "email";
  suffix?: string;
}

interface SettingSection {
  id: string;
  title: string;
  icon: React.ElementType;
  fields: SettingField[];
}

const sections: SettingSection[] = [
  {
    id: "agency_plans",
    title: "Plans agences",
    icon: Building2,
    fields: [
      { key: "starter_price_dzd", label: "Prix Starter (DZD/mois)", type: "number", suffix: "DZD" },
      { key: "starter_max_listings", label: "Starter — Max annonces", type: "number" },
      { key: "starter_max_photos", label: "Starter — Max photos/annonce", type: "number" },
      { key: "starter_max_team", label: "Starter — Max membres", type: "number" },
      { key: "pro_price_dzd", label: "Prix Pro (DZD/mois)", type: "number", suffix: "DZD" },
      { key: "pro_max_listings", label: "Pro — Max annonces", type: "number" },
      { key: "pro_max_photos", label: "Pro — Max photos/annonce", type: "number" },
      { key: "pro_max_team", label: "Pro — Max membres", type: "number" },
      { key: "enterprise_price_dzd", label: "Prix Enterprise (DZD/mois)", type: "number", suffix: "DZD" },
      { key: "enterprise_max_listings", label: "Enterprise — Max annonces", type: "number" },
      { key: "enterprise_max_photos", label: "Enterprise — Max photos/annonce", type: "number" },
      { key: "enterprise_max_team", label: "Enterprise — Max membres", type: "number" },
    ],
  },
  {
    id: "individual_limits",
    title: "Limites particuliers",
    icon: Users,
    fields: [
      { key: "free_max_listings", label: "Gratuit — Max annonces", type: "number" },
      { key: "free_max_photos", label: "Gratuit — Max photos/annonce", type: "number" },
      { key: "chaab_plus_max_listings", label: "Chaab Plus — Max annonces", type: "number" },
      { key: "chaab_plus_max_photos", label: "Chaab Plus — Max photos/annonce", type: "number" },
      { key: "chaab_pro_max_listings", label: "Chaab Pro — Max annonces", type: "number" },
      { key: "chaab_pro_max_photos", label: "Chaab Pro — Max photos/annonce", type: "number" },
    ],
  },
  {
    id: "payment",
    title: "Paiement",
    icon: CreditCard,
    fields: [
      { key: "payment_provider", label: "Provider principal", type: "text" },
      { key: "bank_name", label: "Banque", type: "text" },
      { key: "bank_rib", label: "RIB", type: "text" },
      { key: "bank_ccp", label: "CCP", type: "text" },
      { key: "bank_iban", label: "IBAN", type: "text" },
    ],
  },
  {
    id: "packs",
    title: "Tarifs packs (DZD)",
    icon: Package,
    fields: [
      { key: "pack_3_price_dzd", label: "Pack 3 annonces", type: "number", suffix: "DZD" },
      { key: "pack_7_price_dzd", label: "Pack 7 annonces", type: "number", suffix: "DZD" },
      { key: "pack_15_price_dzd", label: "Pack 15 annonces", type: "number", suffix: "DZD" },
    ],
  },
  {
    id: "subscriptions",
    title: "Tarifs abonnements (DZD/mois)",
    icon: CreditCard,
    fields: [
      { key: "chaab_plus_price_dzd", label: "Chaab Plus", type: "number", suffix: "DZD" },
      { key: "chaab_pro_price_dzd", label: "Chaab Pro", type: "number", suffix: "DZD" },
    ],
  },
  {
    id: "moderation",
    title: "Modération",
    icon: Shield,
    fields: [
      { key: "agency_listing_moderation", label: "Modération annonces agences", type: "toggle" },
      { key: "individual_listing_moderation", label: "Modération annonces particuliers", type: "toggle" },
    ],
  },
  {
    id: "system",
    title: "Système",
    icon: Settings,
    fields: [
      { key: "maintenance_mode", label: "Mode maintenance", type: "toggle" },
      { key: "contact_email", label: "Email contact", type: "email" },
      { key: "eur_dzd_rate", label: "Taux EUR/DZD", type: "number" },
    ],
  },
];

export function PlatformSettingsEditor({
  initialSettings,
}: PlatformSettingsEditorProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const setting of initialSettings) {
      map[setting.key] = setting.value;
    }
    return map;
  });
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [errorKeys, setErrorKeys] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  function handleChange(key: string, newValue: string) {
    setValues((prev) => ({ ...prev, [key]: newValue }));
    setSavedKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });

    // Debounce save
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key]);
    }
    debounceTimers.current[key] = setTimeout(() => {
      startTransition(async () => {
        const result = await updatePlatformSettingAction(key, newValue);
        if (result.success) {
          setSavedKeys((prev) => new Set(prev).add(key));
          setErrorKeys((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
          // Clear saved indicator after 2s
          setTimeout(() => {
            setSavedKeys((prev) => {
              const next = new Set(prev);
              next.delete(key);
              return next;
            });
          }, 2000);
        } else {
          setErrorKeys((prev) => new Set(prev).add(key));
        }
      });
    }, 1500);
  }

  function handleToggle(key: string) {
    const current = values[key] === "true";
    handleChange(key, String(!current));
  }

  // Cleanup timers
  useEffect(() => {
    return () => {
      for (const timer of Object.values(debounceTimers.current)) {
        clearTimeout(timer);
      }
    };
  }, []);

  return (
    <div className="space-y-8">
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <div
            key={section.id}
            className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
              <Icon className="h-4 w-4 text-stone-500 dark:text-stone-400" />
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {section.title}
              </h3>
            </div>

            <div className="p-5 space-y-4">
              {section.fields.map((field) => {
                const isSaved = savedKeys.has(field.key);
                const isError = errorKeys.has(field.key);

                if (field.type === "toggle") {
                  const isActive = values[field.key] === "true";
                  return (
                    <div
                      key={field.key}
                      className="flex items-center justify-between"
                    >
                      <label className="text-sm text-stone-700 dark:text-stone-300">
                        {field.label}
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isActive}
                          onClick={() => handleToggle(field.key)}
                          className={cn(
                            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200",
                            isActive
                              ? "bg-teal-600 dark:bg-teal-500"
                              : "bg-stone-300 dark:bg-stone-600"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5",
                              isActive
                                ? "translate-x-5 ms-0.5"
                                : "translate-x-0.5"
                            )}
                          />
                        </button>
                        {isSaved && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        {isError && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={field.key}>
                    <label className="block text-sm text-stone-700 dark:text-stone-300 mb-1">
                      {field.label}
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
                        value={values[field.key] ?? ""}
                        onChange={(e) =>
                          handleChange(field.key, e.target.value)
                        }
                        className={cn(
                          "w-full rounded-md border bg-stone-50 dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-teal-600 transition-colors",
                          isError
                            ? "border-red-400 dark:border-red-600"
                            : "border-stone-300 dark:border-stone-600",
                          field.suffix && "pe-14"
                        )}
                      />
                      {field.suffix && (
                        <span className="absolute end-3 text-xs text-stone-400 dark:text-stone-500 pointer-events-none">
                          {field.suffix}
                        </span>
                      )}
                      <div className="absolute end-3 flex items-center gap-1 pointer-events-none">
                        {field.suffix && <span className="hidden" />}
                      </div>
                      {isSaved && (
                        <Check className="absolute end-3 h-4 w-4 text-green-500" />
                      )}
                      {isError && (
                        <AlertCircle className="absolute end-3 h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
