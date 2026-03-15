"use client";

import React, { useState, useTransition, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { createListingAction } from "../actions/create-listing.action";
import { upsertTranslationAction } from "../actions/upsert-translation.action";
import {
  getSignedUploadUrlAction,
  finalizeMediaUploadAction,
} from "@/features/media/actions/upload.action";
import { getCommunesForWilaya } from "@/features/marketplace/actions/get-communes.action";
import { LISTING_TYPES, PROPERTY_TYPES } from "../schemas/listing.schema";
import type { PropertyType } from "../schemas/listing.schema";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MAX_PHOTOS = 20;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const STEPS = [
  { key: "type",      label: "Type" },
  { key: "location",  label: "Localisation" },
  { key: "specs",     label: "Caractéristiques" },
  { key: "amenities", label: "Équipements" },
  { key: "desc",      label: "Description" },
  { key: "photos",    label: "Photos" },
] as const;

const CONDITIONS = [
  { value: "new",         label: "Neuf / Jamais habité" },
  { value: "good",        label: "Bon état" },
  { value: "to_renovate", label: "À rénover" },
] as const;

const ORIENTATIONS = ["N", "S", "E", "O", "NE", "NO", "SE", "SO"] as const;

const LISTING_TYPE_META: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
  sale: {
    label: "Vente",
    description: "Cession définitive du bien immobilier",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  rent: {
    label: "Location",
    description: "Location longue durée (bail de 1 an+)",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
  },
  vacation: {
    label: "Location saisonnière",
    description: "Location courte durée, vacances, Airbnb",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
};

const PROPERTY_TYPE_META: Record<string, { label: string; icon: React.ReactNode }> = {
  apartment: {
    label: "Appartement",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  villa: {
    label: "Villa / Maison",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  terrain: {
    label: "Terrain",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
  commercial: {
    label: "Local commercial",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
      </svg>
    ),
  },
  office: {
    label: "Bureau",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  building: {
    label: "Immeuble",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  farm: {
    label: "Ferme / Corps de ferme",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
  },
  warehouse: {
    label: "Hangar / Entrepôt",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
      </svg>
    ),
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Amenity definitions
// ─────────────────────────────────────────────────────────────────────────────

interface AmenityDef {
  key: string;
  label: string;
  emoji: string;
  excludeFor?: PropertyType[];
  onlyFor?: PropertyType[];
}

interface AmenityCategory {
  label: string;
  onlyFor?: PropertyType[];
  items: AmenityDef[];
}

const AMENITY_CATEGORIES: AmenityCategory[] = [
  {
    label: "Général",
    items: [
      { key: "has_elevator",  label: "Ascenseur",       emoji: "🛗", excludeFor: ["terrain", "farm", "warehouse"] },
      { key: "has_parking",   label: "Parking",         emoji: "🅿️" },
      { key: "has_balcony",   label: "Balcon",          emoji: "🏗️", excludeFor: ["terrain", "commercial", "warehouse", "farm"] },
      { key: "has_terrace",   label: "Terrasse",        emoji: "🌿", excludeFor: ["terrain", "warehouse"] },
      { key: "has_pool",      label: "Piscine",         emoji: "🏊", excludeFor: ["terrain", "office", "commercial", "warehouse"] },
      { key: "has_garden",    label: "Jardin",          emoji: "🌳", excludeFor: ["office", "commercial", "warehouse", "apartment"] },
      { key: "furnished",     label: "Meublé",          emoji: "🛋️", excludeFor: ["terrain", "building", "farm", "warehouse"] },
    ],
  },
  {
    label: "Confort",
    items: [
      { key: "has_ac",               label: "Climatisation",     emoji: "❄️", excludeFor: ["terrain", "farm"] },
      { key: "has_central_heating",  label: "Chauffage central", emoji: "🔥", excludeFor: ["terrain", "farm"] },
      { key: "has_water_heater",     label: "Chauffe-eau",       emoji: "🚿", excludeFor: ["terrain", "warehouse"] },
      { key: "has_double_glazing",   label: "Double vitrage",    emoji: "🪟", excludeFor: ["terrain", "farm"] },
    ],
  },
  {
    label: "Sécurité",
    items: [
      { key: "has_digicode",   label: "Digicode / Badge",     emoji: "🔐", excludeFor: ["terrain", "farm"] },
      { key: "has_interphone", label: "Interphone / Visiophone", emoji: "📞", excludeFor: ["terrain", "farm"] },
      { key: "has_alarm",      label: "Alarme",                emoji: "🚨" },
      { key: "has_guard",      label: "Gardien / Concierge",   emoji: "👮" },
      { key: "has_cameras",    label: "Vidéosurveillance",     emoji: "📹" },
    ],
  },
  {
    label: "Connectivité",
    items: [
      { key: "has_fiber",     label: "Fibre optique",   emoji: "📡", excludeFor: ["terrain", "farm"] },
      { key: "has_satellite", label: "Antenne satellite", emoji: "📺", excludeFor: ["terrain", "warehouse"] },
    ],
  },
  {
    label: "Infrastructure (terrain)",
    onlyFor: ["terrain", "farm", "building"],
    items: [
      { key: "has_road_access",       label: "Accès route goudronnée", emoji: "🛣️" },
      { key: "has_electricity",       label: "Raccordement électricité", emoji: "⚡" },
      { key: "has_water_connection",  label: "Raccordement eau potable", emoji: "💧" },
      { key: "has_gas_connection",    label: "Raccordement gaz",        emoji: "🔥" },
    ],
  },
  {
    label: "Professionnel",
    onlyFor: ["commercial", "office", "warehouse"],
    items: [
      { key: "has_shop_window",   label: "Vitrine commerciale",  emoji: "🏪" },
      { key: "has_loading_dock",  label: "Quai de chargement",   emoji: "🚛" },
      { key: "has_meeting_room",  label: "Salle de réunion",     emoji: "🗂️" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Data shape
// ─────────────────────────────────────────────────────────────────────────────

interface PhotoEntry {
  id: string;
  file: File;
  preview: string;
}

interface WizardData {
  // Step 1
  listing_type: string;
  property_type: string;
  // Step 2
  agency_id: string;
  wilaya_code: string;
  commune_id: string;
  current_price: string;
  negotiable: boolean;
  // Step 3
  surface_m2: string;
  land_area_m2: string;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  floor: string;
  total_floors: string;
  year_built: string;
  condition: string;
  orientation: string;
  // Step 4 — amenities (boolean flags)
  [key: `has_${string}`]: boolean;
  furnished: boolean;
  // Step 5
  title_fr: string;
  description_fr: string;
}

function buildInitialData(agencyId: string): WizardData {
  return {
    listing_type: "", property_type: "",
    agency_id: agencyId,
    wilaya_code: "", commune_id: "",
    current_price: "", negotiable: false,
    surface_m2: "", land_area_m2: "",
    rooms: 0, bedrooms: 0, bathrooms: 0, toilets: 0,
    floor: "", total_floors: "", year_built: "", condition: "", orientation: "",
    // amenities
    has_elevator: false, has_parking: false, has_balcony: false, has_terrace: false,
    has_pool: false, has_garden: false, furnished: false,
    has_ac: false, has_central_heating: false, has_water_heater: false, has_double_glazing: false,
    has_digicode: false, has_interphone: false, has_alarm: false, has_guard: false, has_cameras: false,
    has_fiber: false, has_satellite: false,
    has_road_access: false, has_electricity: false, has_water_connection: false, has_gas_connection: false,
    has_shop_window: false, has_loading_dock: false, has_meeting_room: false,
    title_fr: "", description_fr: "",
  };
}

function generateSlug(title: string, suffix: string): string {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60) +
    "-" +
    suffix
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      {STEPS.map((s, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all"
                style={{
                  background: done ? "#16a34a" : active ? "#09090b" : "#f1f5f9",
                  color: done || active ? "#fff" : "#94a3b8",
                  boxShadow: active ? "0 0 0 4px rgba(9,9,11,0.15)" : "none",
                }}
              >
                {done ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : idx}
              </div>
              <span
                className="hidden text-[10px] font-medium sm:block"
                style={{ color: active ? "#09090b" : done ? "#16a34a" : "#94a3b8" }}
              >
                {s.label}
              </span>
            </div>
            {i < total - 1 && (
              <div
                className="mb-5 h-px flex-1 mx-1.5 sm:mx-2 transition-all"
                style={{ background: done ? "#16a34a" : "#e2e8f0" }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Counter({
  label, value, onChange, min = 0, max = 20,
}: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:border-zinc-900 hover:text-zinc-900 disabled:opacity-40"
        >–</button>
        <span className="w-8 text-center text-lg font-semibold text-gray-800">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:border-zinc-900 hover:text-zinc-900 disabled:opacity-40"
        >+</button>
      </div>
    </div>
  );
}

function AmenityToggle({
  amenityKey, label, emoji, checked, onChange,
}: { amenityKey: string; label: string; emoji: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left transition-all"
      style={{
        borderColor: checked ? "#09090b" : "#e2e8f0",
        background: checked ? "rgba(9,9,11,0.05)" : "#fff",
      }}
    >
      <span className="text-base leading-none">{emoji}</span>
      <span className="text-sm font-medium" style={{ color: checked ? "#09090b" : "#374151" }}>
        {label}
      </span>
      {checked && (
        <svg className="ms-auto h-4 w-4 shrink-0 text-zinc-900" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main wizard
// ─────────────────────────────────────────────────────────────────────────────

interface CreateListingWizardProps {
  agencyId: string;
  wilayas: { code: string; name: string }[];
}

export function CreateListingWizard({ agencyId, wilayas }: CreateListingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(() => buildInitialData(agencyId));
  const [communes, setCommunes] = useState<{ id: number; name_fr: string }[]>([]);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState("");
  const [submitError, setSubmitError] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  const propertyType = data.property_type as PropertyType | "";

  // ── Field helpers ──────────────────────────────────────────────────────────

  function set<K extends keyof WizardData>(field: K, value: WizardData[K]) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function setAmenity(key: string, value: boolean) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  function canAdvance(): boolean {
    switch (step) {
      case 1: return data.listing_type !== "" && data.property_type !== "";
      case 2: return data.current_price !== "" && data.wilaya_code !== "";
      case 3: return true;
      case 4: return true;
      case 5: return data.title_fr.trim().length >= 10 && data.description_fr.trim().length >= 30;
      case 6: return true;
      default: return false;
    }
  }

  // ── Photo management ───────────────────────────────────────────────────────

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const valid: PhotoEntry[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED_PHOTO_TYPES.includes(file.type)) continue;
      if (file.size > MAX_PHOTO_BYTES) continue;
      if (photos.length + valid.length >= MAX_PHOTOS) break;
      valid.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      });
    }
    setPhotos((prev) => [...prev, ...valid]);
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      const next = prev.filter((p) => p.id !== id);
      if (coverIndex >= idx && coverIndex > 0) setCoverIndex((c) => c - 1);
      return next;
    });
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    addPhotos(e.dataTransfer.files);
  }, [photos]);

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleFinalSubmit() {
    setIsSubmitting(true);
    setSubmitError("");

    // 1 — Build details JSONB
    const details: Record<string, unknown> = {};
    if (data.negotiable)         details.negotiable = true;
    if (data.condition)          details.condition = data.condition;
    if (data.orientation)        details.orientation = data.orientation;
    if (data.floor !== "")       details.floor = Number(data.floor);
    if (data.total_floors !== "") details.total_floors = Number(data.total_floors);
    if (data.year_built !== "")  details.year_built = Number(data.year_built);
    if (data.land_area_m2 !== "") details.land_area_m2 = Number(data.land_area_m2);
    if (data.bedrooms > 0)       details.bedrooms = data.bedrooms;
    if (data.toilets > 0)        details.toilets = data.toilets;
    // boolean amenities
    const amenityKeys = AMENITY_CATEGORIES.flatMap((c) => c.items.map((i) => i.key));
    for (const key of amenityKeys) {
      if (data[key as keyof WizardData]) details[key] = true;
    }
    if (data.furnished) details.furnished = true;

    // 2 — Create listing
    setSubmitProgress("Création de l'annonce…");
    const formData = new FormData();
    formData.set("agency_id", data.agency_id);
    formData.set("listing_type", data.listing_type);
    formData.set("property_type", data.property_type);
    formData.set("current_price", data.current_price);
    formData.set("wilaya_code", data.wilaya_code);
    if (data.commune_id) formData.set("commune_id", data.commune_id);
    if (data.surface_m2) formData.set("surface_m2", data.surface_m2);
    if (data.rooms > 0) formData.set("rooms", String(data.rooms));
    if (data.bathrooms > 0) formData.set("bathrooms", String(data.bathrooms));
    if (Object.keys(details).length > 0) formData.set("details", JSON.stringify(details));

    const createResult = await createListingAction(null, formData);
    if (!createResult.success) {
      setSubmitError(createResult.error.message);
      setIsSubmitting(false);
      return;
    }
    const listingId = createResult.data.listing_id;

    // 3 — Upsert FR translation
    if (data.title_fr && data.description_fr) {
      setSubmitProgress("Enregistrement de la description…");
      const slug = generateSlug(data.title_fr, listingId.slice(0, 8));
      await upsertTranslationAction({
        listing_id: listingId,
        locale: "fr",
        title: data.title_fr.trim(),
        description: data.description_fr.trim(),
        slug,
      });
    }

    // 4 — Upload photos
    if (photos.length > 0) {
      const supabase = createClient();
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        if (!photo) continue;
        setSubmitProgress(`Upload photo ${i + 1} / ${photos.length}…`);

        const urlResult = await getSignedUploadUrlAction({
          listing_id: listingId,
          file_name: photo.file.name,
          content_type: photo.file.type as "image/jpeg" | "image/png" | "image/webp",
          file_size_bytes: photo.file.size,
        });

        if (!urlResult.success) continue;

        const { error: uploadError } = await supabase.storage
          .from("listing-media")
          .uploadToSignedUrl(urlResult.data.storage_path, urlResult.data.token, photo.file, {
            contentType: photo.file.type,
          });

        if (uploadError) continue;

        await finalizeMediaUploadAction({
          listing_id: listingId,
          storage_path: urlResult.data.storage_path,
          content_type: photo.file.type,
          file_size_bytes: photo.file.size,
        });
      }
    }

    // 5 — Navigate
    router.push(`/AqarPro/dashboard/listings/${listingId}/edit`);
  }

  // ── Visible amenity categories ─────────────────────────────────────────────

  const visibleCategories = AMENITY_CATEGORIES.filter((cat) => {
    if (cat.onlyFor && propertyType && !cat.onlyFor.includes(propertyType as PropertyType)) return false;
    return true;
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  const totalSteps = STEPS.length;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back link */}
      <div className="mb-5">
        <Link
          href="/AqarPro/dashboard/listings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-zinc-900"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Mes annonces
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Nouvelle annonce</h1>

      <StepIndicator current={step} total={totalSteps} />

      {/* Error banner */}
      {submitError && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {submitError}
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

        {/* ── STEP 1: Type ── */}
        {step === 1 && (
          <div className="space-y-7">
            <h2 className="text-lg font-semibold text-zinc-800">Type d&apos;annonce &amp; de bien</h2>

            {/* Listing type */}
            <div>
              <p className="mb-3 text-sm font-medium text-gray-700">Nature de la transaction</p>
              <div className="space-y-2.5">
                {LISTING_TYPES.map((type) => {
                  const meta = LISTING_TYPE_META[type];
                  const sel = data.listing_type === type;
                  if (!meta) return null;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => set("listing_type", type)}
                      className="flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all"
                      style={{
                        borderColor: sel ? "#09090b" : "#e2e8f0",
                        background: sel ? "rgba(9,9,11,0.04)" : "#fff",
                      }}
                    >
                      <span style={{ color: sel ? "#09090b" : "#9ca3af" }}>{meta.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold" style={{ color: sel ? "#09090b" : "#1f2937" }}>{meta.label}</p>
                        <p className="text-xs text-gray-500">{meta.description}</p>
                      </div>
                      {sel && (
                        <svg className="h-5 w-5 shrink-0 text-zinc-900" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Property type */}
            <div>
              <p className="mb-3 text-sm font-medium text-gray-700">Type de bien</p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {PROPERTY_TYPES.map((type) => {
                  const meta = PROPERTY_TYPE_META[type];
                  const sel = data.property_type === type;
                  if (!meta) return null;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => set("property_type", type)}
                      className="flex flex-col items-center gap-2 rounded-xl border-2 p-3.5 text-center transition-all"
                      style={{
                        borderColor: sel ? "#09090b" : "#e2e8f0",
                        background: sel ? "rgba(9,9,11,0.04)" : "#fff",
                      }}
                    >
                      <span style={{ color: sel ? "#09090b" : "#9ca3af" }}>{meta.icon}</span>
                      <span className="text-xs font-medium leading-tight" style={{ color: sel ? "#09090b" : "#374151" }}>
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Location & Price ── */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-zinc-800">Localisation &amp; prix</h2>

            {/* Wilaya */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Wilaya <span className="text-red-500">*</span>
              </label>
              <select
                value={data.wilaya_code}
                onChange={(e) => {
                  const code = e.target.value;
                  set("wilaya_code", code);
                  set("commune_id", "");
                  setCommunes([]);
                  if (code) {
                    startTransition(async () => {
                      const result = await getCommunesForWilaya(code);
                      setCommunes(result);
                    });
                  }
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
              >
                <option value="">— Sélectionner une wilaya —</option>
                {wilayas.map((w) => (
                  <option key={w.code} value={w.code}>{w.code} – {w.name}</option>
                ))}
              </select>
            </div>

            {/* Commune */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Commune
                <span className="ms-1 text-xs text-gray-400">(optionnel)</span>
              </label>
              <select
                value={data.commune_id}
                onChange={(e) => set("commune_id", e.target.value)}
                disabled={communes.length === 0}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">
                  {communes.length === 0
                    ? isPending ? "Chargement…" : "Sélectionner d'abord une wilaya"
                    : "— Toutes communes —"}
                </option>
                {communes.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name_fr}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Prix <span className="text-red-500">*</span>
              </label>
              <div className="flex overflow-hidden rounded-xl border border-gray-300 focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/20">
                <input
                  type="number"
                  min="0"
                  value={data.current_price}
                  onChange={(e) => set("current_price", e.target.value)}
                  className="flex-1 bg-white px-4 py-3 text-sm focus:outline-none"
                  placeholder="Ex: 8 500 000"
                />
                <span className="flex items-center border-s border-gray-300 bg-gray-50 px-3 text-sm font-semibold text-gray-600">
                  DZD
                </span>
              </div>
              <label className="mt-2 flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.negotiable}
                  onChange={(e) => set("negotiable", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-zinc-900"
                />
                <span className="text-sm text-gray-600">Prix négociable</span>
              </label>
            </div>

            {/* Surface */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Surface habitable
                  <span className="ms-1 text-xs text-gray-400">(optionnel)</span>
                </label>
                <div className="flex overflow-hidden rounded-xl border border-gray-300 focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/20">
                  <input
                    type="number"
                    min="0"
                    value={data.surface_m2}
                    onChange={(e) => set("surface_m2", e.target.value)}
                    className="flex-1 bg-white px-4 py-3 text-sm focus:outline-none"
                    placeholder="Ex: 85"
                  />
                  <span className="flex items-center border-s border-gray-300 bg-gray-50 px-3 text-sm font-medium text-gray-500">m²</span>
                </div>
              </div>

              {/* Land area — only for terrain, villa, farm, building */}
              {(propertyType === "terrain" || propertyType === "villa" || propertyType === "farm" || propertyType === "building") && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Surface terrain
                    <span className="ms-1 text-xs text-gray-400">(optionnel)</span>
                  </label>
                  <div className="flex overflow-hidden rounded-xl border border-gray-300 focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/20">
                    <input
                      type="number"
                      min="0"
                      value={data.land_area_m2}
                      onChange={(e) => set("land_area_m2", e.target.value)}
                      className="flex-1 bg-white px-4 py-3 text-sm focus:outline-none"
                      placeholder="Ex: 300"
                    />
                    <span className="flex items-center border-s border-gray-300 bg-gray-50 px-3 text-sm font-medium text-gray-500">m²</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: Characteristics ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-zinc-800">Caractéristiques du bien</h2>
              <p className="mt-0.5 text-sm text-gray-500">Tous les champs sont optionnels mais enrichissent votre annonce.</p>
            </div>

            {/* Rooms / Bedrooms / Bathrooms / Toilets */}
            {propertyType !== "terrain" && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <Counter label="Pièces (total)" value={data.rooms} onChange={(v) => set("rooms", v)} max={30} />
                <Counter label="Chambres" value={data.bedrooms} onChange={(v) => set("bedrooms", v)} max={20} />
                <Counter label="Salles de bain" value={data.bathrooms} onChange={(v) => set("bathrooms", v)} max={10} />
                <Counter label="WC séparés" value={data.toilets} onChange={(v) => set("toilets", v)} max={10} />
              </div>
            )}

            {/* Floor / Total floors — apartments, office, commercial */}
            {(propertyType === "apartment" || propertyType === "office" || propertyType === "commercial") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Étage</label>
                  <select
                    value={data.floor}
                    onChange={(e) => set("floor", e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none"
                  >
                    <option value="">— Non précisé —</option>
                    <option value="0">Rez-de-chaussée</option>
                    {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={String(n)}>{n}{n === 1 ? "er" : "e"} étage</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Nombre d&apos;étages (immeuble)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={data.total_floors}
                    onChange={(e) => set("total_floors", e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none"
                    placeholder="Ex: 6"
                  />
                </div>
              </div>
            )}

            {/* Year built & Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Année de construction</label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={data.year_built}
                  onChange={(e) => set("year_built", e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none"
                  placeholder="Ex: 2010"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">État général</label>
                <select
                  value={data.condition}
                  onChange={(e) => set("condition", e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none"
                >
                  <option value="">— Non précisé —</option>
                  {CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Orientation */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Orientation</label>
              <div className="flex flex-wrap gap-2">
                {ORIENTATIONS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => set("orientation", data.orientation === o ? "" : o)}
                    className="rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-all"
                    style={{
                      borderColor: data.orientation === o ? "#09090b" : "#e2e8f0",
                      background: data.orientation === o ? "rgba(9,9,11,0.06)" : "#fff",
                      color: data.orientation === o ? "#09090b" : "#374151",
                    }}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Amenities ── */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-zinc-800">Équipements &amp; prestations</h2>
              <p className="mt-0.5 text-sm text-gray-500">Sélectionnez tout ce qui s&apos;applique à votre bien.</p>
            </div>

            {visibleCategories.map((cat) => {
              const visibleItems = cat.items.filter((item) => {
                if (item.excludeFor && propertyType && item.excludeFor.includes(propertyType as PropertyType)) return false;
                return true;
              });
              if (visibleItems.length === 0) return null;
              return (
                <div key={cat.label}>
                  <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-gray-400">{cat.label}</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {visibleItems.map((item) => (
                      <AmenityToggle
                        key={item.key}
                        amenityKey={item.key}
                        label={item.label}
                        emoji={item.emoji}
                        checked={Boolean(data[item.key as keyof WizardData])}
                        onChange={(v) => setAmenity(item.key, v)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── STEP 5: Title & Description ── */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-zinc-800">Titre &amp; description</h2>
              <p className="mt-0.5 text-sm text-gray-500">
                Un titre accrocheur et une description complète multiplient les contacts.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Titre de l&apos;annonce (FR) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.title_fr}
                onChange={(e) => set("title_fr", e.target.value)}
                maxLength={120}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                placeholder="Ex: Bel appartement F4 avec vue mer, Oran centre"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                <span>Min. 10 caractères · Max. 120</span>
                <span className={data.title_fr.length < 10 ? "text-red-400" : "text-green-500"}>
                  {data.title_fr.length}/120
                </span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Description (FR) <span className="text-red-500">*</span>
              </label>
              <textarea
                value={data.description_fr}
                onChange={(e) => set("description_fr", e.target.value)}
                rows={8}
                maxLength={3000}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                placeholder={`Décrivez votre bien en détail :\n\n• Situation et emplacement (quartier, proximité services, transports)\n• Caractéristiques principales (surface, étage, luminosité, vue)\n• Prestations (cuisine équipée, parquet, double vitrage…)\n• Environnement (calme, commerces, écoles à proximité)\n• Informations pratiques (disponibilité, charges, etc.)`}
              />
              <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                <span>Min. 30 caractères pour continuer · Max. 3000</span>
                <span className={data.description_fr.length < 30 ? "text-red-400" : "text-green-500"}>
                  {data.description_fr.length}/3000
                </span>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="mb-2 text-xs font-semibold text-blue-700">💡 Conseils pour une annonce de qualité</p>
              <ul className="space-y-1 text-xs text-blue-600">
                <li>• Mentionnez le quartier précis et les commodités à proximité</li>
                <li>• Indiquez la luminosité, l&apos;état et les rénovations récentes</li>
                <li>• Précisez les charges mensuelles et la disponibilité</li>
                <li>• Évitez les majuscules excessives et les abréviations</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── STEP 6: Photos ── */}
        {step === 6 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-zinc-800">Photos</h2>
              <p className="mt-0.5 text-sm text-gray-500">
                Ajoutez jusqu&apos;à {MAX_PHOTOS} photos. La première photo sélectionnée sera la photo de couverture.
                Formats acceptés : JPG, PNG, WebP — max 10 Mo par photo.
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => photoInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 p-8 transition-all hover:border-zinc-900/50 hover:bg-gray-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Glissez vos photos ici ou{" "}
                  <span className="text-zinc-900 underline">cliquez pour parcourir</span>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {photos.length}/{MAX_PHOTOS} photo{photos.length !== 1 ? "s" : ""} ajoutée{photos.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(e) => addPhotos(e.target.files)}
            />

            {/* Photo grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((photo, idx) => (
                  <div key={photo.id} className="group relative overflow-hidden rounded-xl">
                    <img
                      src={photo.preview}
                      alt=""
                      className="h-32 w-full object-cover"
                    />
                    {/* Cover badge */}
                    {idx === coverIndex && (
                      <div className="absolute start-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                        Couverture
                      </div>
                    )}
                    {/* Photo number */}
                    <div className="absolute end-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-[10px] font-bold text-white">
                      {idx + 1}
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      {idx !== coverIndex && (
                        <button
                          type="button"
                          onClick={() => setCoverIndex(idx)}
                          title="Définir comme couverture"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white transition-transform hover:scale-110"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        title="Supprimer"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-110"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add more slot */}
                {photos.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="flex h-32 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition-all hover:border-zinc-900/50 hover:text-zinc-900"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className="text-xs font-medium">Ajouter</span>
                  </button>
                )}
              </div>
            )}

            {/* Tips */}
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p className="mb-1.5 text-xs font-semibold text-amber-700">📸 Conseils photo</p>
              <ul className="space-y-1 text-xs text-amber-700">
                <li>• Photo de façade / extérieur en premier</li>
                <li>• Pièces à vivre, chambres, cuisine, salle de bain ensuite</li>
                <li>• Prenez en mode paysage (16:9 ou 3:2), bonne lumière naturelle</li>
                <li>• Au moins 5 photos pour maximiser la visibilité</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Précédent
            </button>
          ) : <div />}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance()}
              className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-900/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suivant
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-amber-500/90 hover:shadow-lg disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {submitProgress || "Création…"}
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Créer l&apos;annonce
                  {photos.length > 0 && (
                    <span className="ms-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                      + {photos.length} photo{photos.length > 1 ? "s" : ""}
                    </span>
                  )}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
