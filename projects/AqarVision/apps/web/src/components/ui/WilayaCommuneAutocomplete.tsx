"use client";

import {
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Wilaya, Commune } from "@/lib/geodata/types";

export interface WilayaCommuneAutocompleteProps {
  onSelect: (wilayaCode: string, communeId: number) => void;
  defaultWilaya?: string;
  defaultCommune?: number;
  communes?: Commune[];
  wilayaLabel?: string;
  communeLabel?: string;
  className?: string;
}

const EMPTY_COMMUNES: Commune[] = [];

export function WilayaCommuneAutocomplete({
  onSelect,
  defaultWilaya,
  defaultCommune,
  communes: communesProp,
  wilayaLabel = "Wilaya",
  communeLabel = "Commune",
  className,
}: WilayaCommuneAutocompleteProps) {
  const tEmpty = useTranslations("common.empty");
  const communes = communesProp ?? EMPTY_COMMUNES;
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [filteredCommunes, setFilteredCommunes] = useState<Commune[]>([]);

  const [selectedWilaya, setSelectedWilaya] = useState<Wilaya | null>(null);
  const [selectedCommune, setSelectedCommune] = useState<Commune | null>(null);

  const [wilayaQuery, setWilayaQuery] = useState("");
  const [communeQuery, setCommuneQuery] = useState("");

  const [wilayaOpen, setWilayaOpen] = useState(false);
  const [communeOpen, setCommuneOpen] = useState(false);

  const [wilayaHighlight, setWilayaHighlight] = useState(-1);
  const [communeHighlight, setCommuneHighlight] = useState(-1);

  const wilayaInputRef = useRef<HTMLInputElement>(null);
  const communeInputRef = useRef<HTMLInputElement>(null);
  const wilayaListRef = useRef<HTMLUListElement>(null);
  const communeListRef = useRef<HTMLUListElement>(null);
  const wilayaContainerRef = useRef<HTMLDivElement>(null);
  const communeContainerRef = useRef<HTMLDivElement>(null);

  const [allCommunes, setAllCommunes] = useState<Commune[]>([]);

  // Load wilayas + communes from database
  useEffect(() => {
    Promise.all([
      import("@/lib/geodata/actions").then((m) => m.getWilayas()),
      communes.length > 0
        ? Promise.resolve(communes)
        : import("@/lib/geodata/actions").then((m) => m.getCommunes()),
    ]).then(([wilayaData, communeData]) => {
      setWilayas(wilayaData);
      setAllCommunes(communeData);

      if (defaultWilaya) {
        const w = wilayaData.find((w) => w.code === defaultWilaya);
        if (w) {
          setSelectedWilaya(w);
          setWilayaQuery(`${w.code} - ${w.name_fr}`);
        }
      }
    });
  }, [defaultWilaya, communes]);

  // Filter communes when wilaya selected
  useEffect(() => {
    if (selectedWilaya) {
      const filtered = allCommunes.filter(
        (c) => c.wilaya_code === selectedWilaya.code
      );
      setFilteredCommunes(filtered);

      if (defaultCommune) {
        const c = filtered.find((c) => c.id === defaultCommune);
        if (c) {
          setSelectedCommune(c);
          setCommuneQuery(c.name_fr);
        }
      }
    } else {
      setFilteredCommunes([]);
      setSelectedCommune(null);
      setCommuneQuery("");
    }
  }, [selectedWilaya, allCommunes, defaultCommune]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wilayaContainerRef.current &&
        !wilayaContainerRef.current.contains(e.target as Node)
      ) {
        setWilayaOpen(false);
      }
      if (
        communeContainerRef.current &&
        !communeContainerRef.current.contains(e.target as Node)
      ) {
        setCommuneOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredWilayas = wilayas.filter((w) => {
    const q = wilayaQuery.toLowerCase();
    return (
      w.name_fr.toLowerCase().includes(q) ||
      (w.name_ar ?? "").includes(wilayaQuery) ||
      w.code.includes(q)
    );
  });

  const filteredCommuneList = filteredCommunes.filter((c) => {
    const q = communeQuery.toLowerCase();
    return (
      c.name_fr.toLowerCase().includes(q) || (c.name_ar ?? "").includes(communeQuery)
    );
  });

  function selectWilaya(w: Wilaya) {
    setSelectedWilaya(w);
    setWilayaQuery(`${w.code} - ${w.name_fr}`);
    setWilayaOpen(false);
    setWilayaHighlight(-1);
    setSelectedCommune(null);
    setCommuneQuery("");
    communeInputRef.current?.focus();
  }

  function selectCommune(c: Commune) {
    setSelectedCommune(c);
    setCommuneQuery(c.name_fr);
    setCommuneOpen(false);
    setCommuneHighlight(-1);
    if (selectedWilaya) {
      onSelect(selectedWilaya.code, c.id);
    }
  }

  function clearWilaya() {
    setSelectedWilaya(null);
    setWilayaQuery("");
    setSelectedCommune(null);
    setCommuneQuery("");
    setFilteredCommunes([]);
    wilayaInputRef.current?.focus();
  }

  function clearCommune() {
    setSelectedCommune(null);
    setCommuneQuery("");
    communeInputRef.current?.focus();
  }

  function handleWilayaKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setWilayaOpen(true);
      setWilayaHighlight((prev) =>
        Math.min(prev + 1, filteredWilayas.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setWilayaHighlight((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && wilayaHighlight >= 0) {
      e.preventDefault();
      selectWilaya(filteredWilayas[wilayaHighlight]!);
    } else if (e.key === "Escape") {
      setWilayaOpen(false);
      setWilayaHighlight(-1);
    }
  }

  function handleCommuneKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCommuneOpen(true);
      setCommuneHighlight((prev) =>
        Math.min(prev + 1, filteredCommuneList.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCommuneHighlight((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && communeHighlight >= 0) {
      e.preventDefault();
      selectCommune(filteredCommuneList[communeHighlight]!);
    } else if (e.key === "Escape") {
      setCommuneOpen(false);
      setCommuneHighlight(-1);
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (wilayaHighlight >= 0 && wilayaListRef.current) {
      const item = wilayaListRef.current.children[wilayaHighlight] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [wilayaHighlight]);

  useEffect(() => {
    if (communeHighlight >= 0 && communeListRef.current) {
      const item = communeListRef.current.children[communeHighlight] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [communeHighlight]);

  const inputBaseClass = cn(
    "w-full h-10 rounded-md border px-3 ps-9 pe-8 text-sm",
    "bg-white dark:bg-stone-950",
    "border-stone-300 dark:border-stone-700",
    "text-stone-900 dark:text-stone-100",
    "placeholder:text-stone-400 dark:placeholder:text-stone-500",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-950",
    "transition-colors duration-fast"
  );

  const dropdownClass = cn(
    "absolute z-dropdown mt-1 w-full max-h-60 overflow-auto rounded-md",
    "bg-white dark:bg-stone-900",
    "border border-stone-200 dark:border-stone-700",
    "shadow-lg",
    "py-1"
  );

  const optionBaseClass = cn(
    "w-full px-3 py-2 text-sm text-start",
    "text-stone-700 dark:text-stone-300",
    "cursor-pointer",
    "transition-colors duration-fast"
  );

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", className)}>
      {/* Wilaya */}
      <div ref={wilayaContainerRef} className="relative">
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          {wilayaLabel}
        </label>
        <div className="relative">
          <MapPin
            size={16}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={wilayaInputRef}
            type="text"
            role="combobox"
            aria-expanded={wilayaOpen}
            aria-controls="wilaya-listbox"
            aria-activedescendant={
              wilayaHighlight >= 0
                ? `wilaya-option-${wilayaHighlight}`
                : undefined
            }
            aria-autocomplete="list"
            value={wilayaQuery}
            onChange={(e) => {
              setWilayaQuery(e.target.value);
              setWilayaOpen(true);
              setWilayaHighlight(-1);
              if (selectedWilaya) {
                setSelectedWilaya(null);
                setSelectedCommune(null);
                setCommuneQuery("");
              }
            }}
            onFocus={() => setWilayaOpen(true)}
            onKeyDown={handleWilayaKeyDown}
            placeholder="Rechercher une wilaya..."
            className={inputBaseClass}
          />
          {selectedWilaya ? (
            <button
              type="button"
              onClick={clearWilaya}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
              aria-label="Clear wilaya"
            >
              <X size={14} aria-hidden="true" />
            </button>
          ) : (
            <ChevronDown
              size={14}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none"
              aria-hidden="true"
            />
          )}
        </div>

        {wilayaOpen && filteredWilayas.length > 0 && (
          <ul
            ref={wilayaListRef}
            id="wilaya-listbox"
            role="listbox"
            className={dropdownClass}
          >
            {filteredWilayas.map((w, idx) => (
              <li
                key={w.code}
                id={`wilaya-option-${idx}`}
                role="option"
                aria-selected={selectedWilaya?.code === w.code}
                onClick={() => selectWilaya(w)}
                className={cn(
                  optionBaseClass,
                  idx === wilayaHighlight &&
                    "bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300",
                  selectedWilaya?.code === w.code &&
                    "bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-medium"
                )}
              >
                <span className="text-stone-400 dark:text-stone-500 me-2 tabular-nums">
                  {w.code}
                </span>
                {w.name_fr}
                <span className="text-stone-400 dark:text-stone-500 ms-2 text-xs">
                  {w.name_ar}
                </span>
              </li>
            ))}
          </ul>
        )}

        {wilayaOpen && filteredWilayas.length === 0 && wilayaQuery && (
          <div className={cn(dropdownClass, "px-3 py-3 text-sm text-stone-500 dark:text-stone-400")}>
            {tEmpty("noResults")}
          </div>
        )}
      </div>

      {/* Commune */}
      <div ref={communeContainerRef} className="relative">
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          {communeLabel}
        </label>
        <div className="relative">
          <Search
            size={16}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={communeInputRef}
            type="text"
            role="combobox"
            aria-expanded={communeOpen}
            aria-controls="commune-listbox"
            aria-activedescendant={
              communeHighlight >= 0
                ? `commune-option-${communeHighlight}`
                : undefined
            }
            aria-autocomplete="list"
            disabled={!selectedWilaya}
            value={communeQuery}
            onChange={(e) => {
              setCommuneQuery(e.target.value);
              setCommuneOpen(true);
              setCommuneHighlight(-1);
              if (selectedCommune) {
                setSelectedCommune(null);
              }
            }}
            onFocus={() => {
              if (selectedWilaya) setCommuneOpen(true);
            }}
            onKeyDown={handleCommuneKeyDown}
            placeholder={
              selectedWilaya
                ? "Rechercher une commune..."
                : "S\u00e9lectionnez une wilaya d\u0027abord"
            }
            className={cn(
              inputBaseClass,
              !selectedWilaya && "opacity-50 cursor-not-allowed"
            )}
          />
          {selectedCommune ? (
            <button
              type="button"
              onClick={clearCommune}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
              aria-label="Clear commune"
            >
              <X size={14} aria-hidden="true" />
            </button>
          ) : (
            <ChevronDown
              size={14}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none"
              aria-hidden="true"
            />
          )}
        </div>

        {communeOpen && filteredCommuneList.length > 0 && (
          <ul
            ref={communeListRef}
            id="commune-listbox"
            role="listbox"
            className={dropdownClass}
          >
            {filteredCommuneList.map((c, idx) => (
              <li
                key={c.id}
                id={`commune-option-${idx}`}
                role="option"
                aria-selected={selectedCommune?.id === c.id}
                onClick={() => selectCommune(c)}
                className={cn(
                  optionBaseClass,
                  idx === communeHighlight &&
                    "bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300",
                  selectedCommune?.id === c.id &&
                    "bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-medium"
                )}
              >
                {c.name_fr}
                <span className="text-stone-400 dark:text-stone-500 ms-2 text-xs">
                  {c.name_ar}
                </span>
              </li>
            ))}
          </ul>
        )}

        {communeOpen &&
          filteredCommuneList.length === 0 &&
          communeQuery &&
          selectedWilaya && (
            <div
              className={cn(
                dropdownClass,
                "px-3 py-3 text-sm text-stone-500 dark:text-stone-400"
              )}
            >
              {tEmpty("noResults")}
            </div>
          )}
      </div>
    </div>
  );
}
