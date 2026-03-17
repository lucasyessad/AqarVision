/**
 * Algeria geographic data — Lookup utilities
 *
 * 69 wilayas (2025 reform) + 1 541 communes, 4 locales (FR/AR/EN/ES).
 *
 * Usage:
 *   import { getWilaya, getWilayaName, getCommunesByWilaya } from "@/lib/geodata";
 */

import type { Wilaya, Commune, Locale } from "./types";
import wilayasData from "./wilayas.json";
import communesData from "./communes.json";

// ── Typed data ──────────────────────────────────────────────────
export const WILAYAS: Wilaya[] = wilayasData as Wilaya[];
export const COMMUNES: Commune[] = communesData as Commune[];

export const TOTAL_WILAYAS = 69;
export const TOTAL_COMMUNES = 1541;

// ── Locale name resolver ────────────────────────────────────────

function nameKey(locale: Locale): keyof Wilaya & keyof Commune {
  const map: Record<Locale, keyof Wilaya & keyof Commune> = {
    fr: "name_fr",
    ar: "name_ar",
    en: "name_en",
    es: "name_es",
  };
  return map[locale] ?? "name_fr";
}

// ── Lookup maps (lazy-initialized singletons) ──────────────────

let _byCode: Map<string, Wilaya> | null = null;
let _byId: Map<number, Wilaya> | null = null;
let _communesByWilaya: Map<number, Commune[]> | null = null;
let _communeById: Map<number, Commune> | null = null;

function wilayaByCode(): Map<string, Wilaya> {
  if (!_byCode) {
    _byCode = new Map(WILAYAS.map((w) => [w.code, w]));
  }
  return _byCode;
}

function wilayaById(): Map<number, Wilaya> {
  if (!_byId) {
    _byId = new Map(WILAYAS.map((w) => [w.id, w]));
  }
  return _byId;
}

function communesByWilayaMap(): Map<number, Commune[]> {
  if (!_communesByWilaya) {
    _communesByWilaya = new Map<number, Commune[]>();
    for (const c of COMMUNES) {
      const list = _communesByWilaya.get(c.wilaya_id);
      if (list) {
        list.push(c);
      } else {
        _communesByWilaya.set(c.wilaya_id, [c]);
      }
    }
  }
  return _communesByWilaya;
}

function communeByIdMap(): Map<number, Commune> {
  if (!_communeById) {
    _communeById = new Map(COMMUNES.map((c) => [c.id, c]));
  }
  return _communeById;
}

// ── Public API ──────────────────────────────────────────────────

/** Get wilaya by two-digit code ("01"–"69"). */
export function getWilaya(code: string): Wilaya | undefined {
  return wilayaByCode().get(code);
}

/** Get wilaya by numeric ID (1–69). */
export function getWilayaById(id: number): Wilaya | undefined {
  return wilayaById().get(id);
}

/** Get localized wilaya name. Falls back to FR. */
export function getWilayaName(code: string, locale: Locale = "fr"): string {
  const w = getWilaya(code);
  if (!w) return code;
  return (w[nameKey(locale)] as string) || w.name_fr;
}

/** Get all communes for a wilaya (by numeric ID). */
export function getCommunesByWilaya(wilayaId: number): Commune[] {
  return communesByWilayaMap().get(wilayaId) ?? [];
}

/** Get all communes for a wilaya (by two-digit code). */
export function getCommunesByWilayaCode(code: string): Commune[] {
  const w = getWilaya(code);
  return w ? getCommunesByWilaya(w.id) : [];
}

/** Get a commune by ID. */
export function getCommune(id: number): Commune | undefined {
  return communeByIdMap().get(id);
}

/** Get localized commune name. Falls back to FR. */
export function getCommuneName(communeId: number, locale: Locale = "fr"): string {
  const c = getCommune(communeId);
  if (!c) return String(communeId);
  return (c[nameKey(locale)] as string) || c.name_fr;
}

/** Full location string: "Commune, Wilaya" */
export function getLocationLabel(
  wilayaCode: string,
  communeId: number | null,
  locale: Locale = "fr"
): string {
  const wilayaName = getWilayaName(wilayaCode, locale);
  if (!communeId) return wilayaName;
  const communeName = getCommuneName(communeId, locale);
  return `${communeName}, ${wilayaName}`;
}

// ── Filtering ───────────────────────────────────────────────────

/** Get wilayas by region (e.g. "Sahara", "North", "Highlands"). */
export function getWilayasByRegion(region: string): Wilaya[] {
  return WILAYAS.filter((w) => w.region === region);
}

/** Get coastal wilayas only. */
export function getCoastalWilayas(): Wilaya[] {
  return WILAYAS.filter((w) => w.coastal);
}

/** Get wilayas added in the 2025 reform. */
export function getNew2025Wilayas(): Wilaya[] {
  return WILAYAS.filter((w) => w.new_2025);
}

// ── Search ──────────────────────────────────────────────────────

/** Search wilayas by name across all locales (case-insensitive). */
export function searchWilayas(query: string): Wilaya[] {
  const q = query.toLowerCase();
  return WILAYAS.filter(
    (w) =>
      w.name_fr.toLowerCase().includes(q) ||
      w.name_en.toLowerCase().includes(q) ||
      w.name_es.toLowerCase().includes(q) ||
      w.name_ar.includes(query)
  );
}

/** Search communes by name across all locales (case-insensitive). */
export function searchCommunes(query: string, wilayaId?: number): Commune[] {
  const q = query.toLowerCase();
  let results = COMMUNES.filter(
    (c) =>
      c.name_fr.toLowerCase().includes(q) ||
      c.name_en.toLowerCase().includes(q) ||
      c.name_es.toLowerCase().includes(q) ||
      c.name_ar.includes(query)
  );
  if (wilayaId !== undefined) {
    results = results.filter((c) => c.wilaya_id === wilayaId);
  }
  return results;
}

// ── Select/dropdown helpers ─────────────────────────────────────

/** Get wilayas formatted for a <select> dropdown. */
export function getWilayaOptions(locale: Locale = "fr") {
  const key = nameKey(locale);
  return WILAYAS.map((w) => ({
    value: w.code,
    label: `${w.code} - ${w[key] as string}`,
  }));
}

/** Get communes formatted for a <select> dropdown. */
export function getCommuneOptions(wilayaCode: string, locale: Locale = "fr") {
  const key = nameKey(locale);
  return getCommunesByWilayaCode(wilayaCode).map((c) => ({
    value: c.id,
    label: c[key] as string,
  }));
}

// ── Map helpers ─────────────────────────────────────────────────

/** Get wilayas with coordinates (for map rendering). */
export function getWilayasWithCoords(): (Wilaya & { lat: number; lng: number })[] {
  return WILAYAS.filter(
    (w): w is Wilaya & { lat: number; lng: number } =>
      w.lat !== null && w.lng !== null
  );
}

/** Get center point of Algeria (approximate). */
export const ALGERIA_CENTER = { lat: 28.0339, lng: 1.6596 } as const;
export const ALGERIA_BOUNDS = {
  north: 37.09,
  south: 18.97,
  west: -8.67,
  east: 12.0,
} as const;

export type { Wilaya, Commune, Locale } from "./types";
