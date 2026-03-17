"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, FileText, Users, BarChart3, Settings, CreditCard, Calendar } from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  group: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  locale: string;
}

export function CommandPalette({ open, onClose, locale }: CommandPaletteProps) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: CommandItem[] = [
    { id: "overview", label: t("nav.overview"), href: `/${locale}/AqarPro/dashboard`, icon: <BarChart3 className="h-4 w-4" />, group: "Pages" },
    { id: "listings", label: t("nav.listings"), href: `/${locale}/AqarPro/dashboard/listings`, icon: <FileText className="h-4 w-4" />, group: "Pages" },
    { id: "leads", label: t("nav.leads"), href: `/${locale}/AqarPro/dashboard/leads`, icon: <Users className="h-4 w-4" />, group: "Pages" },
    { id: "visits", label: t("nav.visit_requests"), href: `/${locale}/AqarPro/dashboard/visit-requests`, icon: <Calendar className="h-4 w-4" />, group: "Pages" },
    { id: "analytics", label: t("nav.analytics"), href: `/${locale}/AqarPro/dashboard/analytics`, icon: <BarChart3 className="h-4 w-4" />, group: "Pages" },
    { id: "team", label: t("nav.team"), href: `/${locale}/AqarPro/dashboard/team`, icon: <Users className="h-4 w-4" />, group: "Pages" },
    { id: "billing", label: t("nav.billing"), href: `/${locale}/AqarPro/dashboard/billing`, icon: <CreditCard className="h-4 w-4" />, group: "Pages" },
    { id: "settings", label: t("nav.settings"), href: `/${locale}/AqarPro/dashboard/settings`, icon: <Settings className="h-4 w-4" />, group: "Pages" },
    { id: "new-listing", label: t("nav.listings") + " → +", href: `/${locale}/AqarPro/dashboard/listings/new`, icon: <FileText className="h-4 w-4" />, group: "Actions" },
  ];

  const filtered = query.length === 0
    ? items
    : items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      );

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group]!.push(item);
    return acc;
  }, {});

  const handleSelect = useCallback(
    (item: CommandItem) => {
      onClose();
      setQuery("");
      router.push(item.href);
    },
    [onClose, router]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === "Enter" && filtered[activeIndex]) {
        handleSelect(filtered[activeIndex]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, filtered, activeIndex, handleSelect]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette */}
      <div className="relative w-full max-w-lg rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-700 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Rechercher une page ou action..."
            className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
          />
          <kbd className="rounded border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2">
          {Object.entries(grouped).map(([group, groupItems]) => (
            <div key={group}>
              <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                {group}
              </p>
              {groupItems.map((item) => {
                flatIndex++;
                const isActive = flatIndex === activeIndex;
                const currentIndex = flatIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(currentIndex)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span className={isActive ? "text-amber-600 dark:text-amber-400" : "text-zinc-400"}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-zinc-400">
              Aucun résultat pour &quot;{query}&quot;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
