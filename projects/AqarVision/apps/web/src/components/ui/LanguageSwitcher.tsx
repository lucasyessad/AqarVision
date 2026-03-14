"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const LOCALES = [
  { code: "fr", label: "FR", name: "Français" },
  { code: "ar", label: "AR", name: "العربية" },
  { code: "en", label: "EN", name: "English" },
  { code: "es", label: "ES", name: "Español" },
] as const;

type LocaleCode = (typeof LOCALES)[number]["code"];

interface LanguageSwitcherProps {
  currentLocale: string;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const current = LOCALES.find((l) => l.code === currentLocale) ?? LOCALES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLocale = (locale: LocaleCode) => {
    setOpen(false);
    // Replace the locale prefix in the URL: /fr/search → /ar/search
    const segments = pathname.split("/");
    // segments[0] is "" (before leading slash), segments[1] is the locale
    if (segments.length >= 2) {
      segments[1] = locale;
    }
    const newPath = segments.join("/");
    router.push(newPath);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Changer la langue"
      >
        <span>{current.label}</span>
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Sélectionner une langue"
          className="absolute end-0 z-50 mt-1 min-w-[9rem] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {LOCALES.map((locale) => (
            <button
              key={locale.code}
              role="option"
              aria-selected={locale.code === currentLocale}
              type="button"
              onClick={() => switchLocale(locale.code)}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-gray-50 ${
                locale.code === currentLocale
                  ? "font-semibold text-[#1a365d]"
                  : "text-[#2d3748]"
              }`}
            >
              <span className="w-6 text-center font-mono text-xs font-bold">
                {locale.label}
              </span>
              <span>{locale.name}</span>
              {locale.code === currentLocale && (
                <svg
                  className="ms-auto h-3.5 w-3.5 text-[#d4af37]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
