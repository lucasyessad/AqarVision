"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { getAgencyUrl } from "@/lib/agency-url";
import {
  Building2,
  BadgeCheck,
  ChevronRight,
  Search,
  X,
  ShieldCheck,
  MapPin,
  ChevronDown,
} from "lucide-react";

interface Agency {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  is_verified: boolean;
  wilaya_codes: string[];
}

interface AgencesClientProps {
  agencies: Agency[];
  wilayas: { code: string; name: string }[];
  wilayaNameMap: Record<string, string>;
  locale: string;
}

export function AgencesClient({ agencies, wilayas, wilayaNameMap, locale }: AgencesClientProps) {
  const [query, setQuery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showWilayaDropdown, setShowWilayaDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const wilayaRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (wilayaRef.current && !wilayaRef.current.contains(e.target as Node)) {
        setShowWilayaDropdown(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Suggestions: agency names matching input
  const suggestions = useMemo(() => {
    if (!query.trim() || query.trim().length < 1) return [];
    const q = query.trim().toLowerCase();
    return agencies
      .filter((a) => a.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [agencies, query]);

  // Filtered wilayas for search within dropdown
  const [wilayaSearch, setWilayaSearch] = useState("");
  const filteredWilayas = useMemo(() => {
    if (!wilayaSearch.trim()) return wilayas;
    const q = wilayaSearch.trim().toLowerCase();
    return wilayas.filter(
      (w) => w.name.toLowerCase().includes(q) || w.code.includes(q)
    );
  }, [wilayas, wilayaSearch]);

  // Main filter
  const filtered = useMemo(() => {
    let list = agencies;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.description ?? "").toLowerCase().includes(q)
      );
    }

    if (verifiedOnly) {
      list = list.filter((a) => a.is_verified);
    }

    if (selectedWilaya) {
      list = list.filter((a) => a.wilaya_codes.includes(selectedWilaya));
    }

    return list;
  }, [agencies, query, verifiedOnly, selectedWilaya]);

  const activeFilterCount = [verifiedOnly, !!selectedWilaya].filter(Boolean).length;

  return (
    <>
      {/* Hero + filters */}
      <div className="border-b border-zinc-800 bg-zinc-950 pb-8 pt-16 dark:border-zinc-700">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-amber-500" />
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-500">
              Annuaire
            </p>
          </div>
          <h1 className="font-display text-3xl font-light text-zinc-50 sm:text-4xl">
            <span className="italic">Trouver</span>{" "}
            <span className="font-semibold">une agence</span>
          </h1>

          {/* Filters row */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* Search input with autocomplete */}
            <div className="relative w-80">
              <Search className="pointer-events-none absolute inset-y-0 start-3.5 my-auto h-4 w-4 text-zinc-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => query.trim().length > 0 && setShowSuggestions(true)}
                placeholder="Nom de l'agence…"
                className="w-full rounded-lg border border-white/15 bg-white/5 py-2.5 pe-9 ps-10 text-sm text-zinc-50 placeholder:text-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setShowSuggestions(false);
                  }}
                  className="absolute inset-y-0 end-3 my-auto text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Autocomplete suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute start-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl"
                >
                  {suggestions.map((agency) => (
                    <button
                      key={agency.id}
                      type="button"
                      onClick={() => {
                        setQuery(agency.name);
                        setShowSuggestions(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-start transition-colors hover:bg-zinc-800"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-zinc-400">
                        {agency.logo_url ? (
                          <Image
                            src={agency.logo_url}
                            alt=""
                            width={32}
                            height={32}
                            className="rounded-lg object-contain"
                          />
                        ) : (
                          agency.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-100">
                          {agency.name}
                        </p>
                        {agency.wilaya_codes.length > 0 && (
                          <p className="truncate text-[10px] text-zinc-500">
                            {agency.wilaya_codes
                              .map((c) => wilayaNameMap[c] ?? c)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                      {agency.is_verified && (
                        <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wilaya dropdown */}
            <div ref={wilayaRef} className="relative">
              <button
                type="button"
                onClick={() => setShowWilayaDropdown((o) => !o)}
                className={[
                  "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                  selectedWilaya
                    ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
                    : "border-white/15 bg-white/5 text-zinc-400 hover:border-white/25 hover:text-zinc-200",
                ].join(" ")}
              >
                <MapPin className="h-4 w-4" />
                {selectedWilaya
                  ? wilayaNameMap[selectedWilaya] ?? selectedWilaya
                  : "Toutes les wilayas"}
                <ChevronDown
                  className={[
                    "h-3.5 w-3.5 transition-transform",
                    showWilayaDropdown ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>

              {showWilayaDropdown && (
                <div className="absolute start-0 top-full z-50 mt-1.5 w-64 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
                  {/* Search within wilayas */}
                  <div className="border-b border-zinc-800 p-2">
                    <input
                      type="text"
                      value={wilayaSearch}
                      onChange={(e) => setWilayaSearch(e.target.value)}
                      placeholder="Rechercher une wilaya…"
                      className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto p-1">
                    {/* "All" option */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWilaya("");
                        setShowWilayaDropdown(false);
                        setWilayaSearch("");
                      }}
                      className={[
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                        !selectedWilaya
                          ? "bg-amber-500/10 font-semibold text-amber-400"
                          : "text-zinc-300 hover:bg-zinc-800",
                      ].join(" ")}
                    >
                      Toutes les wilayas
                    </button>

                    {filteredWilayas.map(({ code, name }) => {
                      const count = agencies.filter((a) =>
                        a.wilaya_codes.includes(code)
                      ).length;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setSelectedWilaya(code);
                            setShowWilayaDropdown(false);
                            setWilayaSearch("");
                          }}
                          className={[
                            "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                            selectedWilaya === code
                              ? "bg-amber-500/10 font-semibold text-amber-400"
                              : "text-zinc-300 hover:bg-zinc-800",
                          ].join(" ")}
                        >
                          <span className="w-5 shrink-0 font-mono text-[10px] text-zinc-500">
                            {code}
                          </span>
                          <span className="flex-1 text-start">{name}</span>
                          {count > 0 && (
                            <span className="text-[10px] tabular-nums text-zinc-600">
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Verified toggle */}
            <button
              type="button"
              onClick={() => setVerifiedOnly((v) => !v)}
              className={[
                "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                verifiedOnly
                  ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
                  : "border-white/15 bg-white/5 text-zinc-400 hover:border-white/25 hover:text-zinc-200",
              ].join(" ")}
            >
              <ShieldCheck className="h-4 w-4" />
              Vérifiées
            </button>

            {/* Reset */}
            {(query || verifiedOnly || selectedWilaya) && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setVerifiedOnly(false);
                  setSelectedWilaya("");
                }}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2.5 text-xs font-medium text-zinc-500 transition-all hover:border-red-500/30 hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
                Réinitialiser
              </button>
            )}
          </div>

          {/* Result count */}
          <p className="mt-4 text-sm text-zinc-50/40">
            <span className="tabular-nums font-medium text-zinc-50/70">
              {filtered.length}
            </span>{" "}
            agence{filtered.length !== 1 ? "s" : ""} trouvée{filtered.length !== 1 ? "s" : ""}
            {selectedWilaya && (
              <span>
                {" "}à{" "}
                <span className="font-medium text-amber-400">
                  {wilayaNameMap[selectedWilaya]}
                </span>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Agency list */}
      <div className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Building2 className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Aucune agence trouvée
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              Essayez de modifier vos critères de recherche
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setVerifiedOnly(false);
                setSelectedWilaya("");
              }}
              className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((agency) => (
              <a
                key={agency.id}
                href={getAgencyUrl(agency.slug)}
                className="group flex items-center gap-5 rounded-xl border border-zinc-200 bg-white px-6 py-5 transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                {/* Logo */}
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-100 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-700">
                  {agency.logo_url ? (
                    <Image
                      src={agency.logo_url}
                      alt={agency.name}
                      fill
                      sizes="56px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <span className="text-lg font-bold text-zinc-400 dark:text-zinc-500">
                      {agency.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Main info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {agency.name}
                    </p>
                    {agency.is_verified && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                        <BadgeCheck className="h-3 w-3" />
                        Vérifiée
                      </span>
                    )}
                  </div>
                  {agency.description && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {agency.description}
                    </p>
                  )}
                  {agency.wilaya_codes.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        {agency.wilaya_codes
                          .map((c) => wilayaNameMap[c] ?? c)
                          .join(" · ")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300 transition-colors group-hover:text-amber-500 dark:text-zinc-600 dark:group-hover:text-amber-400" />
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
