"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { type Locale } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

interface LocaleOption {
  code: Locale;
  label: string;
  nativeLabel: string;
  dir: "ltr" | "rtl";
}

const locales: LocaleOption[] = [
  { code: "fr", label: "French", nativeLabel: "Francais", dir: "ltr" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "es", label: "Spanish", nativeLabel: "Espanol", dir: "ltr" },
];

export interface LanguageSwitcherProps {
  currentLocale: Locale;
  className?: string;
}

export function LanguageSwitcher({
  currentLocale,
  className,
}: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const current = locales.find((l) => l.code === currentLocale) ?? locales[0]!;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function switchLocale(locale: Locale) {
    router.replace(pathname, { locale });
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent, locale: Locale) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      switchLocale(locale);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative inline-flex", className)}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Switch language"
        className={cn(
          "inline-flex items-center gap-2 rounded-md px-3 py-2",
          "text-sm text-stone-700 dark:text-stone-300",
          "hover:bg-stone-100 dark:hover:bg-stone-800",
          "transition-colors duration-fast",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-950"
        )}
      >
        <Globe size={16} aria-hidden="true" />
        <span className="uppercase font-medium">{current.code}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select language"
          className={cn(
            "absolute top-full end-0 mt-1 z-dropdown",
            "min-w-[160px] rounded-lg",
            "bg-white dark:bg-stone-900",
            "border border-stone-200 dark:border-stone-800",
            "shadow-lg",
            "py-1",
            "animate-slide-down"
          )}
        >
          {locales.map((locale) => {
            const isActive = locale.code === currentLocale;
            return (
              <li
                key={locale.code}
                role="option"
                aria-selected={isActive}
                tabIndex={0}
                onClick={() => switchLocale(locale.code)}
                onKeyDown={(e) => handleKeyDown(e, locale.code)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 cursor-pointer",
                  "text-sm transition-colors duration-fast",
                  isActive
                    ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="font-medium">{locale.nativeLabel}</span>
                  <span className="text-stone-400 dark:text-stone-500 uppercase text-xs">
                    {locale.code}
                  </span>
                </span>
                {isActive && (
                  <Check
                    size={14}
                    className="text-teal-600 dark:text-teal-400 shrink-0"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
