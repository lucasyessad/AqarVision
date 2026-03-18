"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Search, Building2, Users, BarChart3, Settings, CreditCard, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

export function CommandPalette() {
  const t = useTranslations("nav");
  const tEmpty = useTranslations("common.empty");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    { id: "listings", label: t("listings"), icon: Building2, href: "/AqarPro/dashboard/listings" },
    { id: "leads", label: t("leads"), icon: Users, href: "/AqarPro/dashboard/leads" },
    { id: "analytics", label: t("analytics"), icon: BarChart3, href: "/AqarPro/dashboard/analytics" },
    { id: "messages", label: t("messages"), icon: MessageSquare, href: "/AqarPro/dashboard/messaging" },
    { id: "billing", label: t("billing"), icon: CreditCard, href: "/AqarPro/dashboard/billing" },
    { id: "settings", label: t("settings"), icon: Settings, href: "/AqarPro/dashboard/settings" },
  ];

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  function handleSelect(href: string) {
    setOpen(false);
    router.push(href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex].href);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={() => setOpen(false)}
      />
      <div className="relative mx-auto mt-[20vh] max-w-lg">
        <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-xl overflow-hidden animate-scale-in">
          <div className="flex items-center gap-3 border-b border-stone-200 dark:border-stone-700 px-4">
            <Search className="h-4 w-4 text-stone-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={tEmpty("searchPlaceholder")}
              className="flex-1 py-3 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none"
            />
            <kbd className="hidden sm:inline-block text-2xs text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">
              Esc
            </kbd>
          </div>
          <ul className="max-h-64 overflow-y-auto py-2">
            {filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <li key={cmd.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(cmd.href)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-fast",
                      i === selectedIndex
                        ? "bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400"
                        : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{cmd.label}</span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-stone-400">
                {tEmpty("noResults")}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
