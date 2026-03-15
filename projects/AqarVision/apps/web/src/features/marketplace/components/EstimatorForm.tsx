"use client";

import { useActionState } from "react";
import { estimatePrice } from "@/features/marketplace/actions/estimate-price.action";

interface WilayaOption {
  code: string;
  name: string;
}

interface EstimatorFormProps {
  wilayas: WilayaOption[];
}

const PROPERTY_TYPES = [
  { value: "apartment", label: "Appartement" },
  { value: "house", label: "Maison / Villa" },
  { value: "land", label: "Terrain" },
  { value: "commercial", label: "Local commercial" },
  { value: "office", label: "Bureau" },
];

const LISTING_TYPES = [
  { value: "sale", label: "Vente" },
  { value: "rent", label: "Location" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function EstimatorForm({ wilayas }: EstimatorFormProps) {
  const [state, formAction, isPending] = useActionState(estimatePrice, null);

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <form action={formAction} className="space-y-5">
          {/* Listing type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-800">
              Type d&apos;opération <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {LISTING_TYPES.map((lt) => (
                <label
                  key={lt.value}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-zinc-800 transition-colors has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-900/5 has-[:checked]:text-zinc-900"
                >
                  <input
                    type="radio"
                    name="listing_type"
                    value={lt.value}
                    defaultChecked={lt.value === "sale"}
                    className="sr-only"
                  />
                  {lt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Property type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-800">
              Type de bien <span className="text-red-500">*</span>
            </label>
            <select
              name="property_type"
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#2d3748] outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
            >
              <option value="">Choisir un type</option>
              {PROPERTY_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Wilaya */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-800">
              Wilaya <span className="text-red-500">*</span>
            </label>
            <select
              name="wilaya_code"
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#2d3748] outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
            >
              <option value="">Sélectionner une wilaya</option>
              {wilayas.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} — {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Surface */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-800">
              Surface (m²) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="surface_m2"
              min={10}
              max={10000}
              required
              placeholder="Ex : 120"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#2d3748] outline-none focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] placeholder:text-zinc-400"
            />
          </div>

          {/* Rooms */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-800">
              Nombre de pièces (facultatif)
            </label>
            <input
              type="number"
              name="rooms"
              min={1}
              max={20}
              placeholder="Ex : 4"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#2d3748] outline-none focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] placeholder:text-zinc-400"
            />
          </div>

          {/* Validation error */}
          {state && !state.success && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {state.error.message}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-900/90 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Calcul en cours...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                Estimer le prix
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result */}
      {state?.success && (
        <div className="animate-in fade-in slide-in-from-bottom-4 rounded-xl border border-amber-500/30 bg-white p-6 shadow-sm duration-300">
          <div className="mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-amber-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-base font-semibold text-zinc-900">
              Résultat de l&apos;estimation
            </h2>
            {state.data.source === "market" && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                {state.data.sample_count} annonce{state.data.sample_count !== 1 ? "s" : ""} analysée{state.data.sample_count !== 1 ? "s" : ""}
              </span>
            )}
            {state.data.source === "reference" && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                Prix de référence
              </span>
            )}
          </div>

          {/* Price range */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-medium text-zinc-400">Prix bas</p>
              <p className="mt-1 text-lg font-bold text-zinc-800">
                {formatCurrency(state.data.price_min)}
              </p>
            </div>
            <div className="rounded-xl bg-zinc-900 p-4 text-white shadow-md">
              <p className="text-xs font-medium text-white/60">Estimation</p>
              <p className="mt-1 text-xl font-bold">
                {formatCurrency(state.data.price_median)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-medium text-zinc-400">Prix haut</p>
              <p className="mt-1 text-lg font-bold text-zinc-800">
                {formatCurrency(state.data.price_max)}
              </p>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-zinc-400">
            Fourchette indicative basée sur les données du marché. Les prix réels peuvent varier selon l&apos;état, l&apos;étage, les équipements et la localisation précise.
          </p>
        </div>
      )}
    </div>
  );
}
