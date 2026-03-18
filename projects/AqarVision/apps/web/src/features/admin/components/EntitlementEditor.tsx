"use client";

import { useState, useTransition, useEffect } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Flag,
  Plus,
  Search,
  Check,
  AlertCircle,
  Trash2,
  Building2,
} from "lucide-react";
import { setEntitlementAction } from "../actions/admin.action";
import type { Entitlement, AdminAgency } from "../types/admin.types";

interface EntitlementEditorProps {
  agencies: Array<{ id: string; name: string; slug: string }>;
}

const DEFAULT_FEATURE_KEYS = [
  "custom_domain",
  "api_access",
  "white_label",
  "priority_support",
  "advanced_analytics",
  "bulk_import",
  "team_permissions",
  "custom_branding",
  "seo_boost",
  "lead_scoring_advanced",
];

export function EntitlementEditor({ agencies }: EntitlementEditorProps) {
  const tEmpty = useTranslations("common.empty");
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>("");
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [searchAgency, setSearchAgency] = useState("");

  // New entitlement form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newMetadata, setNewMetadata] = useState("{}");

  const filteredAgencies = agencies.filter(
    (a) =>
      a.name.toLowerCase().includes(searchAgency.toLowerCase()) ||
      a.slug.toLowerCase().includes(searchAgency.toLowerCase())
  );

  // Load entitlements when agency changes
  useEffect(() => {
    if (!selectedAgencyId) {
      setEntitlements([]);
      return;
    }

    setIsLoading(true);
    // Fetch from server via action — for simplicity we use the initial data pattern
    // In practice this would call a server action or fetch endpoint
    setIsLoading(false);
  }, [selectedAgencyId]);

  function handleToggle(featureKey: string, currentEnabled: boolean) {
    startTransition(async () => {
      const result = await setEntitlementAction(
        selectedAgencyId,
        featureKey,
        !currentEnabled
      );
      if (result.success) {
        setEntitlements((prev) =>
          prev.map((e) =>
            e.feature_key === featureKey
              ? { ...e, enabled: !currentEnabled }
              : e
          )
        );
        setSavedKeys((prev) => new Set(prev).add(featureKey));
        setTimeout(() => {
          setSavedKeys((prev) => {
            const next = new Set(prev);
            next.delete(featureKey);
            return next;
          });
        }, 2000);
      }
    });
  }

  function handleAddEntitlement() {
    if (!newKey || !selectedAgencyId) return;

    let metadata: Record<string, unknown> = {};
    try {
      metadata = JSON.parse(newMetadata);
    } catch {
      return;
    }

    startTransition(async () => {
      const result = await setEntitlementAction(
        selectedAgencyId,
        newKey,
        true,
        metadata
      );
      if (result.success) {
        setEntitlements((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            agency_id: selectedAgencyId,
            feature_key: newKey,
            enabled: true,
            metadata,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
        setNewKey("");
        setNewMetadata("{}");
        setShowAddForm(false);
      }
    });
  }

  function handleDisable(featureKey: string) {
    startTransition(async () => {
      const result = await setEntitlementAction(
        selectedAgencyId,
        featureKey,
        false
      );
      if (result.success) {
        setEntitlements((prev) =>
          prev.filter((e) => e.feature_key !== featureKey)
        );
      }
    });
  }

  // Build combined list of default keys + existing entitlements
  const allKeys = [
    ...new Set([
      ...DEFAULT_FEATURE_KEYS,
      ...entitlements.map((e) => e.feature_key),
    ]),
  ].sort();

  return (
    <div className="space-y-6">
      {/* Agency selector */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5">
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
          Sélectionner une agence
        </label>
        <div className="relative max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchAgency}
            onChange={(e) => setSearchAgency(e.target.value)}
            placeholder="Rechercher une agence..."
            className="w-full rounded-md border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 ps-9 pe-3 py-2 text-sm text-stone-700 dark:text-stone-300 outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        {searchAgency && (
          <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
            {filteredAgencies.length === 0 ? (
              <p className="px-3 py-2 text-xs text-stone-400 dark:text-stone-500">
                {tEmpty("noAgencies")}
              </p>
            ) : (
              filteredAgencies.slice(0, 10).map((agency) => (
                <button
                  key={agency.id}
                  type="button"
                  onClick={() => {
                    setSelectedAgencyId(agency.id);
                    setSearchAgency("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-sm text-start hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors",
                    selectedAgencyId === agency.id &&
                      "bg-teal-50 dark:bg-teal-950"
                  )}
                >
                  <Building2 className="h-4 w-4 text-stone-400 dark:text-stone-500 shrink-0" />
                  <span className="text-stone-900 dark:text-stone-100">
                    {agency.name}
                  </span>
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    @{agency.slug}
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        {selectedAgencyId && (
          <p className="mt-2 text-sm text-teal-600 dark:text-teal-400">
            Agence sélectionnée :{" "}
            {agencies.find((a) => a.id === selectedAgencyId)?.name}
          </p>
        )}
      </div>

      {/* Entitlements list */}
      {selectedAgencyId ? (
        <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Droits et fonctionnalités
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 rounded-md bg-teal-600 dark:bg-teal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </button>
          </div>

          {/* Add form */}
          {showAddForm && (
            <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 space-y-3">
              <div>
                <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">
                  Clé de fonctionnalité
                </label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="ex: custom_feature"
                  className="w-full max-w-xs rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">
                  Metadata (JSON)
                </label>
                <textarea
                  value={newMetadata}
                  onChange={(e) => setNewMetadata(e.target.value)}
                  rows={3}
                  className="w-full max-w-md rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 font-mono outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddEntitlement}
                disabled={!newKey || isPending}
                className="rounded-md bg-teal-600 dark:bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors disabled:opacity-50"
              >
                {isPending ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          )}

          {/* Feature list */}
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {allKeys.map((key) => {
              const entitlement = entitlements.find(
                (e) => e.feature_key === key
              );
              const isEnabled = entitlement?.enabled ?? false;
              const isSaved = savedKeys.has(key);

              return (
                <div
                  key={key}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Flag
                      className={cn(
                        "h-4 w-4",
                        isEnabled
                          ? "text-teal-600 dark:text-teal-400"
                          : "text-stone-300 dark:text-stone-600"
                      )}
                    />
                    <div>
                      <span className="text-sm text-stone-900 dark:text-stone-100 font-mono">
                        {key}
                      </span>
                      {entitlement?.metadata &&
                        Object.keys(entitlement.metadata).length > 0 && (
                          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                            {JSON.stringify(entitlement.metadata)}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSaved && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isEnabled}
                      onClick={() => handleToggle(key, isEnabled)}
                      disabled={isPending}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 disabled:opacity-50",
                        isEnabled
                          ? "bg-teal-600 dark:bg-teal-500"
                          : "bg-stone-300 dark:bg-stone-600"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5",
                          isEnabled
                            ? "translate-x-5 ms-0.5"
                            : "translate-x-0.5"
                        )}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-5 py-12 text-center">
          <Flag className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-600 mb-3" />
          <p className="text-sm text-stone-400 dark:text-stone-500">
            {tEmpty("selectAgency")}
          </p>
        </div>
      )}
    </div>
  );
}
