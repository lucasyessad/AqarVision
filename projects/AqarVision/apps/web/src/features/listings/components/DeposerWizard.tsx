"use client";

import { useState, useTransition, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCommunesForWilaya } from "@/features/marketplace/actions/get-communes.action";
import { createIndividualListingAction } from "../actions/create-individual-listing.action";
import type { ActionResult } from "../types/listing.types";
import type { CreateIndividualListingResult } from "../actions/create-individual-listing.action";

/* ── Types ─────────────────────────────────────────────────────────── */

interface DeposerWizardProps {
  wilayas: { code: string; name: string }[];
  activeCount: number;
  quota: number;
}

type ListingType = "sale" | "rent" | "vacation";
type PropertyType =
  | "apartment"
  | "villa"
  | "terrain"
  | "commercial"
  | "office"
  | "building"
  | "farm"
  | "warehouse";

/* ── Step progress indicator ────────────────────────────────────────── */

const STEPS = ["Type", "Localisation & Prix", "Détails", "Récapitulatif"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-8 flex items-center gap-0">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                i <= current
                  ? "border-zinc-950 bg-zinc-950 text-zinc-50"
                  : "border-zinc-200 bg-zinc-200 text-zinc-400",
              ].join(" ")}
            >
              {i < current ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={["hidden text-xs sm:block", i <= current ? "text-zinc-950" : "text-zinc-400"].join(" ")}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={["mx-2 h-0.5 w-12 sm:w-20", i < current ? "bg-zinc-950" : "bg-zinc-200"].join(" ")} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Card select component ──────────────────────────────────────────── */

function SelectCard({
  selected, onClick, icon, label, description,
}: {
  selected: boolean; onClick: () => void; icon: React.ReactNode; label: string; description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-4 rounded-xl border-2 p-5 text-start transition-all",
        selected
          ? "border-zinc-950 bg-zinc-950/[0.04] text-zinc-950"
          : "border-zinc-200 bg-zinc-50 text-zinc-500",
      ].join(" ")}
    >
      <div className={[
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
        selected ? "bg-zinc-950 text-zinc-50" : "bg-zinc-200 text-zinc-400",
      ].join(" ")}>
        {icon}
      </div>
      <div>
        <div className="font-semibold">{label}</div>
        {description && <div className="text-xs text-zinc-400">{description}</div>}
      </div>
    </button>
  );
}

function SmallCard({
  selected, onClick, icon, label,
}: {
  selected: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
        selected
          ? "border-zinc-950 bg-zinc-950/[0.04] text-zinc-950"
          : "border-zinc-200 bg-zinc-50 text-zinc-500",
      ].join(" ")}
    >
      <div className={[
        "flex h-10 w-10 items-center justify-center rounded-lg",
        selected ? "bg-zinc-950 text-zinc-50" : "bg-zinc-200 text-zinc-400",
      ].join(" ")}>
        {icon}
      </div>
      <span className="text-center text-xs font-medium leading-tight">{label}</span>
    </button>
  );
}

/* ── Counter component ──────────────────────────────────────────────── */

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm font-medium text-zinc-950">{label}</span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-lg text-zinc-500 transition-colors"
        >
          −
        </button>
        <span className="w-8 text-center text-lg font-semibold tabular-nums text-zinc-950">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-lg text-zinc-500 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ── SVG icons ──────────────────────────────────────────────────────── */

const LISTING_TYPE_OPTIONS: { value: ListingType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "sale",
    label: "Vente",
    description: "Mettre en vente votre bien",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
      </svg>
    ),
  },
  {
    value: "rent",
    label: "Location",
    description: "Louer votre bien",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
  },
  {
    value: "vacation",
    label: "Vacances",
    description: "Location saisonnière courte durée",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
];

const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string; icon: React.ReactNode }[] = [
  {
    value: "apartment", label: "Appartement",
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
  },
  {
    value: "villa", label: "Villa",
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" /></svg>,
  },
  {
    value: "terrain", label: "Terrain",
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  },
  {
    value: "commercial", label: "Local comm.",
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>,
  },
  {
    value: "office", label: "Bureau",
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>,
  },
  {
    value: "building", label: "Immeuble",
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>,
  },
  {
    value: "farm", label: "Ferme",
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
  },
  {
    value: "warehouse", label: "Entrepôt",
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
  },
];

/* ── Section wrapper class ──────────────────────────────────────────── */

const section = "rounded-xl border border-zinc-200 bg-white p-6";

/* ── Main wizard ────────────────────────────────────────────────────── */

export function DeposerWizard({ wilayas, activeCount, quota }: DeposerWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();

  const [listingType, setListingType] = useState<ListingType | null>(null);
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);

  const [wilayaCode, setWilayaCode] = useState("");
  const [communeId, setCommuneId] = useState<number | null>(null);
  const [communes, setCommunes] = useState<{ id: number; name_fr: string }[]>([]);
  const [price, setPrice] = useState("");
  const [surface, setSurface] = useState("");

  const [title, setTitle] = useState("");
  const [rooms, setRooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [hasElevator, setHasElevator] = useState(false);
  const [hasParking, setHasParking] = useState(false);
  const [hasBalcony, setHasBalcony] = useState(false);
  const [hasPool, setHasPool] = useState(false);
  const [hasGarden, setHasGarden] = useState(false);
  const [furnished, setFurnished] = useState(false);

  const [actionState, submitAction, isSubmitting] = useActionState(createIndividualListingAction, null);

  useEffect(() => {
    if (actionState?.success) {
      router.push("/AqarChaab/espace/mes-annonces");
    }
  }, [actionState, router]);

  const handleWilayaChange = (code: string) => {
    setWilayaCode(code);
    setCommuneId(null);
    setCommunes([]);
    if (code) {
      startTransition(async () => {
        const result = await getCommunesForWilaya(code);
        setCommunes(result);
      });
    }
  };

  const canProceedStep0 = listingType !== null && propertyType !== null;
  const canProceedStep1 = wilayaCode !== "" && price !== "" && Number(price) > 0;
  const canProceedStep2 = title.length >= 10;

  const handleSubmit = () => {
    const formData = new FormData();
    formData.set("listing_type", listingType!);
    formData.set("property_type", propertyType!);
    formData.set("wilaya_code", wilayaCode);
    if (communeId) formData.set("commune_id", String(communeId));
    formData.set("title", title);
    formData.set("current_price", price);
    if (surface) formData.set("surface_m2", surface);
    if (rooms > 0) formData.set("rooms", String(rooms));
    if (bathrooms > 0) formData.set("bathrooms", String(bathrooms));
    formData.set("details", JSON.stringify({ has_elevator: hasElevator, has_parking: hasParking, has_balcony: hasBalcony, has_pool: hasPool, has_garden: hasGarden, furnished }));
    startTransition(() => {
      submitAction(formData);
    });
  };

  const wilayaName = wilayas.find((w) => w.code === wilayaCode)?.name ?? "";
  const communeName = communes.find((c) => c.id === communeId)?.name_fr ?? "";
  const listingTypeLabel = LISTING_TYPE_OPTIONS.find((o) => o.value === listingType)?.label ?? "";
  const propertyTypeLabel = PROPERTY_TYPE_OPTIONS.find((o) => o.value === propertyType)?.label ?? "";

  const inputClass = "w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-950 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950";

  return (
    <div>
      <StepIndicator current={step} />

      {/* ── Step 0: Type d'annonce + Type de bien ─────────────────── */}
      {step === 0 && (
        <div className="flex flex-col gap-6">
          <div className={section}>
            <h2 className="mb-4 text-base font-semibold text-zinc-950">Type d'annonce</h2>
            <div className="flex flex-col gap-3">
              {LISTING_TYPE_OPTIONS.map((opt) => (
                <SelectCard key={opt.value} selected={listingType === opt.value} onClick={() => setListingType(opt.value)} icon={opt.icon} label={opt.label} description={opt.description} />
              ))}
            </div>
          </div>

          <div className={section}>
            <h2 className="mb-4 text-base font-semibold text-zinc-950">Type de bien</h2>
            <div className="grid grid-cols-4 gap-3">
              {PROPERTY_TYPE_OPTIONS.map((opt) => (
                <SmallCard key={opt.value} selected={propertyType === opt.value} onClick={() => setPropertyType(opt.value)} icon={opt.icon} label={opt.label} />
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={() => setStep(1)} disabled={!canProceedStep0} className="rounded-lg bg-zinc-950 px-6 py-3 text-sm font-semibold text-zinc-50 transition-opacity disabled:opacity-40">
              Suivant →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 1: Localisation & Prix ───────────────────────────── */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          <div className={section}>
            <h2 className="mb-4 text-base font-semibold text-zinc-950">Localisation</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-950">Wilaya</label>
                <select value={wilayaCode} onChange={(e) => handleWilayaChange(e.target.value)} className={inputClass}>
                  <option value="">Sélectionner une wilaya</option>
                  {wilayas.map((w) => (
                    <option key={w.code} value={w.code}>{w.code} – {w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-950">
                  Commune <span className="font-normal text-zinc-400">(optionnel)</span>
                </label>
                <select value={communeId ?? ""} onChange={(e) => setCommuneId(e.target.value ? Number(e.target.value) : null)} disabled={!wilayaCode || isPending} className={inputClass + " disabled:opacity-50"}>
                  <option value="">{isPending ? "Chargement…" : "Toutes communes"}</option>
                  {communes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name_fr}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={section}>
            <h2 className="mb-4 text-base font-semibold text-zinc-950">Prix & Surface</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-950">Prix</label>
                <div className="flex overflow-hidden rounded-lg border border-zinc-200">
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" min="0" className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-zinc-950 outline-none" />
                  <div className="flex items-center border-l border-zinc-200 bg-zinc-200 px-3 text-sm font-medium text-zinc-400">DZD</div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-950">
                  Surface <span className="font-normal text-zinc-400">(optionnel)</span>
                </label>
                <div className="flex overflow-hidden rounded-lg border border-zinc-200">
                  <input type="number" value={surface} onChange={(e) => setSurface(e.target.value)} placeholder="0" min="0" className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-zinc-950 outline-none" />
                  <div className="flex items-center border-l border-zinc-200 bg-zinc-200 px-3 text-sm font-medium text-zinc-400">m²</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(0)} className="rounded-lg border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-500 transition-colors">← Retour</button>
            <button type="button" onClick={() => setStep(2)} disabled={!canProceedStep1} className="rounded-lg bg-zinc-950 px-6 py-3 text-sm font-semibold text-zinc-50 transition-opacity disabled:opacity-40">Suivant →</button>
          </div>
        </div>
      )}

      {/* ── Step 2: Détails ───────────────────────────────────────── */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          <div className={section}>
            <h2 className="mb-4 text-base font-semibold text-zinc-950">Titre de l'annonce</h2>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Bel appartement F3 lumineux, vue dégagée, quartier calme"
              rows={3}
              maxLength={120}
              className={[
                "w-full resize-none rounded-lg border px-3.5 py-2.5 text-sm text-zinc-950 outline-none",
                title.length > 0 && title.length < 10 ? "border-danger" : "border-zinc-200",
              ].join(" ")}
            />
            <div className="mt-1 flex justify-between text-xs text-zinc-400">
              {title.length > 0 && title.length < 10 && (
                <span className="text-danger">Minimum 10 caractères</span>
              )}
              <span className="ms-auto">{title.length}/120</span>
            </div>
          </div>

          <div className={section}>
            <h2 className="mb-4 text-base font-semibold text-zinc-950">Pièces & Salle de bains</h2>
            <div className="divide-y divide-zinc-200">
              <Counter label="Pièces" value={rooms} onChange={setRooms} />
              <Counter label="Salle de bains" value={bathrooms} onChange={setBathrooms} />
            </div>
          </div>

          <div className={section}>
            <h2 className="mb-4 text-base font-semibold text-zinc-950">Équipements</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(
                [
                  { key: "has_elevator", label: "Ascenseur", value: hasElevator, set: setHasElevator },
                  { key: "has_parking",  label: "Parking",   value: hasParking,  set: setHasParking  },
                  { key: "has_balcony",  label: "Balcon",    value: hasBalcony,  set: setHasBalcony  },
                  { key: "has_pool",     label: "Piscine",   value: hasPool,     set: setHasPool     },
                  { key: "has_garden",   label: "Jardin",    value: hasGarden,   set: setHasGarden   },
                  { key: "furnished",    label: "Meublé",    value: furnished,   set: setFurnished   },
                ] as const
              ).map(({ key, label, value, set }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set(!value)}
                  className={[
                    "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all",
                    value
                      ? "border-zinc-950 bg-zinc-950/[0.05] font-semibold text-zinc-950"
                      : "border-zinc-200 bg-zinc-50 font-normal text-zinc-500",
                  ].join(" ")}
                >
                  <span className={["flex h-4 w-4 shrink-0 items-center justify-center rounded border", value ? "border-zinc-950 bg-zinc-950" : "border-zinc-200 bg-transparent"].join(" ")}>
                    {value && (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="rounded-lg border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-500 transition-colors">← Retour</button>
            <button type="button" onClick={() => setStep(3)} disabled={!canProceedStep2} className="rounded-lg bg-zinc-950 px-6 py-3 text-sm font-semibold text-zinc-50 transition-opacity disabled:opacity-40">Suivant →</button>
          </div>
        </div>
      )}

      {/* ── Step 3: Récapitulatif ─────────────────────────────────── */}
      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div className={section}>
            <h2 className="mb-5 text-base font-semibold text-zinc-950">Récapitulatif de votre annonce</h2>

            <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {listingTypeLabel} · {propertyTypeLabel}
              </p>
              <p className="mt-1 font-display text-xl font-semibold text-zinc-950">{title}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {wilayaName}{communeName ? `, ${communeName}` : ""}
              </p>
            </div>

            <div className="divide-y divide-zinc-200">
              {[
                { label: "Prix", value: `${Number(price).toLocaleString("fr-DZ")} DZD` },
                ...(surface ? [{ label: "Surface", value: `${surface} m²` }] : []),
                ...(rooms > 0 ? [{ label: "Pièces", value: String(rooms) }] : []),
                ...(bathrooms > 0 ? [{ label: "Salle de bains", value: String(bathrooms) }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2.5 text-sm">
                  <span className="text-zinc-400">{label}</span>
                  <span className="font-medium text-zinc-950">{value}</span>
                </div>
              ))}

              {[hasElevator && "Ascenseur", hasParking && "Parking", hasBalcony && "Balcon", hasPool && "Piscine", hasGarden && "Jardin", furnished && "Meublé"].filter(Boolean).join(", ") && (
                <div className="flex justify-between py-2.5 text-sm">
                  <span className="text-zinc-400">Équipements</span>
                  <span className="max-w-[60%] text-end font-medium text-zinc-950">
                    {[hasElevator && "Ascenseur", hasParking && "Parking", hasBalcony && "Balcon", hasPool && "Piscine", hasGarden && "Jardin", furnished && "Meublé"].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-lg border border-success/20 bg-success/5 p-3 text-sm">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-success">
                Votre annonce sera publiée immédiatement.{" "}
                <span className="font-medium">
                  Il vous restera {quota - activeCount - 1} emplacement{quota - activeCount - 1 !== 1 ? "s" : ""} libre{quota - activeCount - 1 !== 1 ? "s" : ""} sur {quota}.
                </span>
              </span>
            </div>

            {actionState && !actionState.success && (
              <div className="mt-4 rounded-lg bg-danger/5 p-3 text-sm text-danger">
                {actionState.error.message}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(2)} className="rounded-lg border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-500">← Retour</button>
            <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="rounded-lg bg-amber-500 px-8 py-3 text-sm font-semibold text-zinc-950 transition-opacity disabled:opacity-50">
              {isSubmitting ? "Publication…" : "Publier l'annonce"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
