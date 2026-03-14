"use client";

import React, { useState, useActionState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { createListingAction } from "../actions/create-listing.action";
import { getCommunesForWilaya } from "@/features/marketplace/actions/get-communes.action";
import type { ActionResult, CreateListingResult } from "../types/listing.types";
import { LISTING_TYPES, PROPERTY_TYPES } from "../schemas/listing.schema";

interface WizardData {
  agency_id: string;
  listing_type: string;
  property_type: string;
  current_price: string;
  wilaya_code: string;
  commune_id: string;
  surface_m2: string;
  rooms: string;
  bathrooms: string;
  has_elevator: boolean;
  has_parking: boolean;
  has_balcony: boolean;
  has_pool: boolean;
  has_garden: boolean;
  furnished: boolean;
}

interface CreateListingWizardProps {
  agencyId: string;
  wilayas: { code: string; name: string }[];
}

const typeDescriptions: Record<string, string> = {
  sale: "Vente définitive du bien",
  rent: "Location longue durée",
  vacation: "Location saisonnière / vacances",
};

const listingTypeIcons: Record<string, React.ReactNode> = {
  sale: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  rent: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  ),
  vacation: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
};

const propertyIcons: Record<string, React.ReactNode> = {
  apartment: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  ),
  villa: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  terrain: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  ),
  commercial: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
    </svg>
  ),
  office: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  ),
  building: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  ),
  farm: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
    </svg>
  ),
  warehouse: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
    </svg>
  ),
};

export function CreateListingWizard({ agencyId, wilayas }: CreateListingWizardProps) {
  const t = useTranslations("listings");
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [communes, setCommunes] = useState<{ id: number; name_fr: string }[]>([]);
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState<WizardData>({
    agency_id: agencyId,
    listing_type: "",
    property_type: "",
    current_price: "",
    wilaya_code: "",
    commune_id: "",
    surface_m2: "",
    rooms: "",
    bathrooms: "",
    has_elevator: false,
    has_parking: false,
    has_balcony: false,
    has_pool: false,
    has_garden: false,
    furnished: false,
  });

  const [state, formAction, isSubmitting] = useActionState<
    ActionResult<CreateListingResult> | null,
    FormData
  >(createListingAction, null);

  useEffect(() => {
    if (state?.success && state.data) {
      router.push(
        `/dashboard/listings/${state.data.listing_id}/edit?tab=translations`
      );
    }
  }, [state, router]);

  function updateField(field: keyof WizardData, value: string | boolean) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function canAdvance(): boolean {
    switch (step) {
      case 1:
        return data.listing_type !== "" && data.property_type !== "";
      case 2:
        return data.current_price !== "" && data.wilaya_code !== "";
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  }

  function handleSubmit() {
    const formData = new FormData();
    formData.set("agency_id", data.agency_id);
    formData.set("listing_type", data.listing_type);
    formData.set("property_type", data.property_type);
    formData.set("current_price", data.current_price);
    formData.set("wilaya_code", data.wilaya_code);
    if (data.commune_id) formData.set("commune_id", data.commune_id);
    if (data.surface_m2) formData.set("surface_m2", data.surface_m2);
    if (data.rooms && Number(data.rooms) > 0) formData.set("rooms", data.rooms);
    if (data.bathrooms && Number(data.bathrooms) > 0) formData.set("bathrooms", data.bathrooms);

    const details: Record<string, boolean> = {};
    if (data.has_elevator) details.has_elevator = true;
    if (data.has_parking) details.has_parking = true;
    if (data.has_balcony) details.has_balcony = true;
    if (data.has_pool) details.has_pool = true;
    if (data.has_garden) details.has_garden = true;
    if (data.furnished) details.furnished = true;
    if (Object.keys(details).length > 0) {
      formData.set("details", JSON.stringify(details));
    }

    formAction(formData);
  }

  const STEPS = [
    { key: "step_type", label: t("step_type") },
    { key: "step_location", label: t("step_location") },
    { key: "step_details", label: t("step_details") },
    { key: "step_review", label: t("step_review") },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard/listings"
          className="text-sm text-gray-500 transition-colors hover:text-[#1a365d]"
        >
          ← Mes annonces
        </Link>
      </div>
      <h1 className="mb-8 text-2xl font-bold text-[#1a365d]">{t("create_title")}</h1>

      {/* Progress stepper */}
      <div className="mb-8 flex items-center">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  i + 1 < step
                    ? "bg-[#1a365d] text-white"
                    : i + 1 === step
                    ? "bg-[#1a365d] text-white ring-4 ring-[#1a365d]/20"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {i + 1 < step ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium ${
                  i + 1 === step ? "text-[#1a365d]" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mb-5 flex-1 border-t-2 mx-2 transition-colors ${
                  i + 1 < step ? "border-[#1a365d]" : "border-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error state */}
      {state?.success === false && (
        <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {state.error.message}
        </div>
      )}

      {/* Step content */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="mb-6 text-lg font-semibold text-[#2d3748]">
          {step === 1 && t("step_type")}
          {step === 2 && t("step_location")}
          {step === 3 && t("step_details")}
          {step === 4 && t("step_review")}
        </h2>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Listing type */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                {t("listing_type")}
              </label>
              <div className="space-y-3">
                {LISTING_TYPES.map((type) => {
                  const isSelected = data.listing_type === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField("listing_type", type)}
                      className={`flex w-full items-center gap-4 rounded-xl border-2 p-5 text-left transition-all ${
                        isSelected
                          ? "border-[#1a365d] bg-[#1a365d]/5"
                          : "border-gray-200 hover:border-[#1a365d]/40 hover:bg-gray-50"
                      }`}
                    >
                      <span className={isSelected ? "text-[#1a365d]" : "text-gray-400"}>
                        {listingTypeIcons[type]}
                      </span>
                      <div>
                        <p className={`font-semibold ${isSelected ? "text-[#1a365d]" : "text-gray-800"}`}>
                          {t(type as never)}
                        </p>
                        <p className="text-sm text-gray-500">{typeDescriptions[type]}</p>
                      </div>
                      {isSelected && (
                        <span className="ms-auto">
                          <svg className="h-5 w-5 text-[#1a365d]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Property type */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                {t("property_type")}
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PROPERTY_TYPES.map((type) => {
                  const isSelected = data.property_type === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField("property_type", type)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                        isSelected
                          ? "border-[#1a365d] bg-[#1a365d]/5"
                          : "border-gray-200 hover:border-[#1a365d]/40 hover:bg-gray-50"
                      }`}
                    >
                      <span className={isSelected ? "text-[#1a365d]" : "text-gray-400"}>
                        {propertyIcons[type]}
                      </span>
                      <span
                        className={`text-xs font-medium leading-tight ${
                          isSelected ? "text-[#1a365d]" : "text-gray-700"
                        }`}
                      >
                        {t(type as never)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Wilaya */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {t("wilaya")} <span className="text-red-500">*</span>
              </label>
              <select
                value={data.wilaya_code}
                onChange={async (e) => {
                  const code = e.target.value;
                  updateField("wilaya_code", code);
                  updateField("commune_id", "");
                  setCommunes([]);
                  if (code) {
                    startTransition(async () => {
                      const result = await getCommunesForWilaya(code);
                      setCommunes(result);
                    });
                  }
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20"
              >
                <option value="">-- Sélectionner une wilaya --</option>
                {wilayas.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.code} – {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Commune */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {t("commune")}
                <span className="ms-1 text-xs text-gray-400">({t("optional")})</span>
              </label>
              <select
                value={data.commune_id}
                onChange={(e) => updateField("commune_id", e.target.value)}
                disabled={communes.length === 0}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">
                  {communes.length === 0
                    ? isPending
                      ? "Chargement..."
                      : "Sélectionner d'abord une wilaya"
                    : "-- Toutes les communes --"}
                </option>
                {communes.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name_fr}
                  </option>
                ))}
              </select>
            </div>

            {/* Prix */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {t("price_dzd")} <span className="text-red-500">*</span>
              </label>
              <div className="flex overflow-hidden rounded-xl border border-gray-300 focus-within:border-[#1a365d] focus-within:ring-2 focus-within:ring-[#1a365d]/20">
                <input
                  type="number"
                  min="0"
                  value={data.current_price}
                  onChange={(e) => updateField("current_price", e.target.value)}
                  className="flex-1 bg-white px-4 py-3 text-sm focus:outline-none"
                  placeholder="Ex: 8500000"
                />
                <span className="flex items-center border-s border-gray-300 bg-gray-50 px-3 text-sm font-medium text-gray-500">
                  DZD
                </span>
              </div>
            </div>

            {/* Surface */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {t("surface")}
                <span className="ms-1 text-xs text-gray-400">({t("optional")})</span>
              </label>
              <div className="flex overflow-hidden rounded-xl border border-gray-300 focus-within:border-[#1a365d] focus-within:ring-2 focus-within:ring-[#1a365d]/20">
                <input
                  type="number"
                  min="0"
                  value={data.surface_m2}
                  onChange={(e) => updateField("surface_m2", e.target.value)}
                  className="flex-1 bg-white px-4 py-3 text-sm focus:outline-none"
                  placeholder="Ex: 85"
                />
                <span className="flex items-center border-s border-gray-300 bg-gray-50 px-3 text-sm font-medium text-gray-500">
                  m²
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">Tous les champs ci-dessous sont optionnels.</p>

            {/* Rooms + Bathrooms */}
            <div className="grid grid-cols-2 gap-4">
              {/* Pièces */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">{t("rooms")}</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateField("rooms", String(Math.max(0, Number(data.rooms || 0) - 1)))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:border-[#1a365d] hover:text-[#1a365d] disabled:opacity-50"
                    disabled={Number(data.rooms || 0) <= 0}
                  >
                    –
                  </button>
                  <span className="w-8 text-center text-lg font-semibold text-gray-800">
                    {data.rooms || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateField("rooms", String(Number(data.rooms || 0) + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:border-[#1a365d] hover:text-[#1a365d]"
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Salles de bain */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">{t("bathrooms")}</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateField("bathrooms", String(Math.max(0, Number(data.bathrooms || 0) - 1)))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:border-[#1a365d] hover:text-[#1a365d] disabled:opacity-50"
                    disabled={Number(data.bathrooms || 0) <= 0}
                  >
                    –
                  </button>
                  <span className="w-8 text-center text-lg font-semibold text-gray-800">
                    {data.bathrooms || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateField("bathrooms", String(Number(data.bathrooms || 0) + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:border-[#1a365d] hover:text-[#1a365d]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Équipements */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-700">Équipements</h4>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  { key: "has_elevator", label: "Ascenseur" },
                  { key: "has_parking", label: "Parking" },
                  { key: "has_balcony", label: "Balcon" },
                  { key: "has_pool", label: "Piscine" },
                  { key: "has_garden", label: "Jardin" },
                  { key: "furnished", label: "Meublé" },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 transition-all ${
                      data[key as keyof WizardData]
                        ? "border-[#1a365d] bg-[#1a365d]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={data[key as keyof WizardData] as boolean}
                      onChange={(e) =>
                        updateField(key as keyof WizardData, e.target.checked as unknown as string)
                      }
                      className="sr-only"
                    />
                    <span
                      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                        data[key as keyof WizardData]
                          ? "border-[#1a365d] bg-[#1a365d]"
                          : "border-gray-300"
                      }`}
                    >
                      {data[key as keyof WizardData] && (
                        <svg
                          className="h-2.5 w-2.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        data[key as keyof WizardData] ? "text-[#1a365d]" : "text-gray-700"
                      }`}
                    >
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Vérifiez les informations avant de créer l&apos;annonce.</p>
            <dl className="divide-y divide-gray-100 rounded-xl bg-gray-50 px-4">
              <div className="flex items-center justify-between py-3">
                <dt className="text-sm text-gray-500">{t("listing_type")}</dt>
                <dd className="text-sm font-semibold text-[#2d3748]">{t(data.listing_type as never)}</dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-sm text-gray-500">{t("property_type")}</dt>
                <dd className="text-sm font-semibold text-[#2d3748]">{t(data.property_type as never)}</dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-sm text-gray-500">{t("price_dzd")}</dt>
                <dd className="text-sm font-semibold text-[#2d3748]">
                  {new Intl.NumberFormat("fr-DZ", {
                    style: "currency",
                    currency: "DZD",
                    minimumFractionDigits: 0,
                  }).format(Number(data.current_price))}
                </dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-sm text-gray-500">{t("wilaya")}</dt>
                <dd className="text-sm font-semibold text-[#2d3748]">
                  {wilayas.find((w) => w.code === data.wilaya_code)?.name ?? data.wilaya_code}
                </dd>
              </div>
              {data.commune_id && communes.length > 0 && (
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-gray-500">{t("commune")}</dt>
                  <dd className="text-sm font-semibold text-[#2d3748]">
                    {communes.find((c) => String(c.id) === data.commune_id)?.name_fr ?? ""}
                  </dd>
                </div>
              )}
              {data.surface_m2 && (
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-gray-500">{t("surface")}</dt>
                  <dd className="text-sm font-semibold text-[#2d3748]">{data.surface_m2} m²</dd>
                </div>
              )}
              {Number(data.rooms) > 0 && (
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-gray-500">{t("rooms")}</dt>
                  <dd className="text-sm font-semibold text-[#2d3748]">{data.rooms}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
              className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              {t("back")}
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3 | 4)}
              disabled={!canAdvance()}
              className="flex items-center gap-2 rounded-xl bg-[#1a365d] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1a365d]/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("next")}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-xl bg-[#d4af37] px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d4af37]/90 disabled:opacity-50"
            >
              {isSubmitting ? t("creating") : t("create_listing")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
