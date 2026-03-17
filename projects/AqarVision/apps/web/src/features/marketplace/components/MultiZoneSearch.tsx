"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { X, MapPin, ChevronDown, Check } from "lucide-react";

interface Wilaya {
  code: string;
  name: string;
}

interface MultiZoneSearchProps {
  wilayas: Wilaya[];
  selected: string[];
  onChange: (codes: string[]) => void;
  maxSelections?: number;
}

export function MultiZoneSearch({
  wilayas,
  selected,
  onChange,
  maxSelections = 5,
}: MultiZoneSearchProps) {
  const t = useTranslations("search");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return wilayas;
    const lower = query.toLowerCase();
    return wilayas.filter((w) => w.name.toLowerCase().includes(lower));
  }, [wilayas, query]);

  const toggleWilaya = (code: string) => {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code));
    } else if (selected.length < maxSelections) {
      onChange([...selected, code]);
    }
  };

  const removeWilaya = (code: string) => {
    onChange(selected.filter((c) => c !== code));
  };

  const getWilayaName = (code: string) =>
    wilayas.find((w) => w.code === code)?.name ?? code;

  return (
    <div className="relative">
      {/* Selected chips + trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full min-h-[38px] flex-wrap items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-start text-sm transition-colors hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-zinc-500"
      >
        <MapPin className="h-4 w-4 flex-none text-zinc-400" />
        {selected.length === 0 ? (
          <span className="text-zinc-500 dark:text-zinc-400">
            {t("select_wilayas")}
          </span>
        ) : (
          selected.map((code) => (
            <span
              key={code}
              className="inline-flex items-center gap-1 rounded-full bg-med-50 px-2 py-0.5 text-xs font-medium text-med-700 dark:bg-med-900/30 dark:text-med-400"
            >
              {getWilayaName(code)}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeWilaya(code);
                }}
                className="hover:text-med-900 dark:hover:text-med-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        )}
        <ChevronDown className="ms-auto h-4 w-4 flex-none text-zinc-400" />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute start-0 top-full z-20 mt-1 w-full rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <div className="border-b border-zinc-200 p-2 dark:border-zinc-700">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search_wilaya")}
                className="w-full rounded border-0 bg-zinc-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-med-500 dark:bg-zinc-700 dark:text-zinc-100"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {t("no_results")}
                </p>
              ) : (
                filtered.map((wilaya) => {
                  const isSelected = selected.includes(wilaya.code);
                  const isDisabled = !isSelected && selected.length >= maxSelections;
                  return (
                    <button
                      key={wilaya.code}
                      onClick={() => toggleWilaya(wilaya.code)}
                      disabled={isDisabled}
                      className={`flex w-full items-center justify-between rounded px-3 py-1.5 text-sm transition-colors ${
                        isSelected
                          ? "bg-med-50 text-med-700 dark:bg-med-900/30 dark:text-med-400"
                          : isDisabled
                            ? "cursor-not-allowed text-zinc-300 dark:text-zinc-600"
                            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      }`}
                    >
                      <span>{wilaya.name}</span>
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                  );
                })
              )}
            </div>
            {selected.length > 0 && (
              <div className="border-t border-zinc-200 px-3 py-2 dark:border-zinc-700">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t("zones_selected", { count: selected.length, max: maxSelections })}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
