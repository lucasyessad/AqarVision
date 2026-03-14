"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createListingAction } from "../actions/create-listing.action";
import type { ActionResult, CreateListingResult } from "../types/listing.types";
import { LISTING_TYPES, PROPERTY_TYPES } from "../schemas/listing.schema";

const TOTAL_STEPS = 4;

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
}

interface CreateListingWizardProps {
  agencyId: string;
}

export function CreateListingWizard({ agencyId }: CreateListingWizardProps) {
  const t = useTranslations("listings");
  const router = useRouter();
  const [step, setStep] = useState(1);
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
  });

  const [state, formAction, isPending] = useActionState<
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

  function updateField(field: keyof WizardData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function canAdvance(): boolean {
    switch (step) {
      case 1:
        return data.listing_type !== "" && data.property_type !== "";
      case 2:
        return data.current_price !== "" && data.wilaya_code !== "";
      case 3:
        return true; // details are optional
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
    if (data.rooms) formData.set("rooms", data.rooms);
    if (data.bathrooms) formData.set("bathrooms", data.bathrooms);
    formAction(formData);
  }

  const inputClassName =
    "w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20";

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-[#1a365d]">
        {t("create_title")}
      </h1>

      {/* Progress bar */}
      <div className="mb-8 flex items-center gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div key={i} className="flex-1">
            <div
              className={`h-2 rounded-full transition-colors ${
                i + 1 <= step ? "bg-[#1a365d]" : "bg-gray-200"
              }`}
            />
            <p className="mt-1 text-center text-xs text-[#a0aec0]">
              {t(`step_${i + 1}`)}
            </p>
          </div>
        ))}
      </div>

      {state?.success === false && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {state.error.message}
        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-sm">
        {/* Step 1: Type + Property Type */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("listing_type")}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LISTING_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateField("listing_type", type)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      data.listing_type === type
                        ? "border-[#1a365d] bg-[#1a365d] text-white"
                        : "border-gray-300 text-gray-700 hover:border-[#1a365d]"
                    }`}
                  >
                    {t(`type_${type}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("property_type")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateField("property_type", type)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      data.property_type === type
                        ? "border-[#1a365d] bg-[#1a365d] text-white"
                        : "border-gray-300 text-gray-700 hover:border-[#1a365d]"
                    }`}
                  >
                    {t(type)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Price + Location */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("price")} (DZD)
              </label>
              <input
                type="number"
                min="0"
                value={data.current_price}
                onChange={(e) => updateField("current_price", e.target.value)}
                className={inputClassName}
                placeholder="0"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("wilaya")}
              </label>
              <input
                type="number"
                min="1"
                max="58"
                value={data.wilaya_code}
                onChange={(e) => updateField("wilaya_code", e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("commune")}
              </label>
              <input
                type="number"
                value={data.commune_id}
                onChange={(e) => updateField("commune_id", e.target.value)}
                className={inputClassName}
                placeholder={t("optional")}
              />
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("surface")} (m²)
              </label>
              <input
                type="number"
                min="0"
                value={data.surface_m2}
                onChange={(e) => updateField("surface_m2", e.target.value)}
                className={inputClassName}
                placeholder={t("optional")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("rooms")}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={data.rooms}
                  onChange={(e) => updateField("rooms", e.target.value)}
                  className={inputClassName}
                  placeholder={t("optional")}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("bathrooms")}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={data.bathrooms}
                  onChange={(e) => updateField("bathrooms", e.target.value)}
                  className={inputClassName}
                  placeholder={t("optional")}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-[#2d3748]">
              {t("review_title")}
            </h2>
            <dl className="divide-y divide-gray-100">
              <div className="flex justify-between py-2">
                <dt className="text-sm text-[#a0aec0]">{t("listing_type")}</dt>
                <dd className="text-sm font-medium text-[#2d3748]">
                  {t(`type_${data.listing_type}`)}
                </dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-sm text-[#a0aec0]">{t("property_type")}</dt>
                <dd className="text-sm font-medium text-[#2d3748]">
                  {t(data.property_type)}
                </dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-sm text-[#a0aec0]">{t("price")}</dt>
                <dd className="text-sm font-medium text-[#2d3748]">
                  {new Intl.NumberFormat("fr-DZ", {
                    style: "currency",
                    currency: "DZD",
                    minimumFractionDigits: 0,
                  }).format(Number(data.current_price))}
                </dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-sm text-[#a0aec0]">{t("wilaya")}</dt>
                <dd className="text-sm font-medium text-[#2d3748]">
                  {data.wilaya_code}
                </dd>
              </div>
              {data.surface_m2 && (
                <div className="flex justify-between py-2">
                  <dt className="text-sm text-[#a0aec0]">{t("surface")}</dt>
                  <dd className="text-sm font-medium text-[#2d3748]">
                    {data.surface_m2} m²
                  </dd>
                </div>
              )}
              {data.rooms && (
                <div className="flex justify-between py-2">
                  <dt className="text-sm text-[#a0aec0]">{t("rooms")}</dt>
                  <dd className="text-sm font-medium text-[#2d3748]">
                    {data.rooms}
                  </dd>
                </div>
              )}
              {data.bathrooms && (
                <div className="flex justify-between py-2">
                  <dt className="text-sm text-[#a0aec0]">{t("bathrooms")}</dt>
                  <dd className="text-sm font-medium text-[#2d3748]">
                    {data.bathrooms}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              {t("back")}
            </button>
          )}

          <div className="flex-1" />

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance()}
              className="rounded-lg bg-[#1a365d] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a365d]/90 disabled:opacity-50"
            >
              {t("next")}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="rounded-lg bg-[#d4af37] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#d4af37]/90 disabled:opacity-50"
            >
              {isPending ? t("creating") : t("create_listing")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
