"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  usePhoneInput,
  defaultCountries,
  parseCountry,
} from "react-international-phone";
import type { CountryIso2 } from "react-international-phone";
import "react-international-phone/style.css";
import { cn } from "@/lib/utils";
import { Search, ChevronDown } from "lucide-react";

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  label,
  error,
  hint,
  required,
  disabled,
  className,
}: PhoneInputProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { phone, inputValue, country, setCountry, handlePhoneValueChange, inputRef } =
    usePhoneInput({
      defaultCountry: "dz",
      value,
      onChange: (data) => onChange(data.phone),
    });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [dropdownOpen]);

  const parsed = defaultCountries.map((c) => parseCountry(c));

  const filtered = search.trim()
    ? parsed.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dialCode.includes(search.replace(/\D/g, ""))
      )
    : parsed;

  const handleSelect = useCallback(
    (iso2: CountryIso2) => {
      setCountry(iso2, { focusOnInput: true });
      setDropdownOpen(false);
      setSearch("");
    },
    [setCountry]
  );

  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
          {label}
          {required && <span className="ms-0.5 text-red-500">*</span>}
        </label>
      )}

      <div className="flex">
        {/* Country selector button */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setDropdownOpen((o) => !o)}
            className={cn(
              "flex h-10 items-center gap-1.5 rounded-s-md border px-2 text-sm",
              "bg-white dark:bg-stone-950",
              "hover:bg-stone-50 dark:hover:bg-stone-900",
              "transition-colors",
              error
                ? "border-red-500 dark:border-red-400"
                : "border-stone-300 dark:border-stone-600",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <span className="text-base leading-none">
              {/* Flag emoji from country iso2 */}
              {country.iso2
                .toUpperCase()
                .replace(/./g, (char) =>
                  String.fromCodePoint(127397 + char.charCodeAt(0))
                )}
            </span>
            <ChevronDown className="h-3 w-3 text-stone-400" />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              className={cn(
                "absolute start-0 top-full z-50 mt-1 w-64 rounded-lg border shadow-lg",
                "bg-white dark:bg-stone-900",
                "border-stone-200 dark:border-stone-700"
              )}
            >
              {/* Search input */}
              <div className="border-b border-stone-200 p-2 dark:border-stone-700">
                <div className="flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-2 dark:border-stone-600 dark:bg-stone-800">
                  <Search className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un pays..."
                    className="h-8 w-full bg-transparent text-sm text-stone-900 placeholder-stone-400 outline-none dark:text-stone-100 dark:placeholder-stone-500"
                  />
                </div>
              </div>

              {/* Country list */}
              <ul className="max-h-52 overflow-y-auto py-1">
                {filtered.length === 0 && (
                  <li className="px-3 py-2 text-sm text-stone-400 dark:text-stone-500">
                    Aucun résultat
                  </li>
                )}
                {filtered.map((c) => (
                  <li key={c.iso2}>
                    <button
                      type="button"
                      onClick={() => handleSelect(c.iso2 as CountryIso2)}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3 py-2 text-sm",
                        "text-stone-700 dark:text-stone-300",
                        "hover:bg-stone-50 dark:hover:bg-stone-800",
                        c.iso2 === country.iso2 &&
                          "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                      )}
                    >
                      <span className="text-base leading-none">
                        {c.iso2
                          .toUpperCase()
                          .replace(/./g, (char) =>
                            String.fromCodePoint(127397 + char.charCodeAt(0))
                          )}
                      </span>
                      <span className="flex-1 truncate text-start">{c.name}</span>
                      <span className="shrink-0 text-stone-400 dark:text-stone-500">
                        +{c.dialCode}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Phone input */}
        <input
          ref={inputRef}
          type="tel"
          value={inputValue}
          onChange={handlePhoneValueChange}
          disabled={disabled}
          aria-label="Numéro de téléphone"
          placeholder=" "
          className={cn(
            "h-10 flex-1 rounded-e-md border px-3 text-sm",
            "bg-white dark:bg-stone-950",
            "text-stone-900 dark:text-stone-100",
            "placeholder:text-stone-400 dark:placeholder:text-stone-500",
            "focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600",
            "transition-colors",
            error
              ? "border-red-500 dark:border-red-400"
              : "border-stone-300 dark:border-stone-600",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">{hint}</p>
      )}
    </div>
  );
}
