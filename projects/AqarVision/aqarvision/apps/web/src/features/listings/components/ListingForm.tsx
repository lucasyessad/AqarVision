"use client";

import { useState, useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { updateListingAction } from "../actions/update-listing.action";
import { TranslationEditor } from "./TranslationEditor";
import type { ActionResult, ListingDetailDto, ListingDto } from "../types/listing.types";
import { LISTING_TYPES, PROPERTY_TYPES } from "../schemas/listing.schema";

type Tab = "details" | "translations" | "preview";

interface ListingFormProps {
  listing: ListingDetailDto;
  initialTab?: Tab;
}

export function ListingForm({ listing, initialTab = "details" }: ListingFormProps) {
  const t = useTranslations("listings");
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [version, setVersion] = useState(listing.version);

  const [state, formAction, isPending] = useActionState<
    ActionResult<ListingDto> | null,
    FormData
  >(updateListingAction, null);

  useEffect(() => {
    if (state?.success && state.data) {
      setVersion(state.data.version);
    }
  }, [state]);

  const inputClassName =
    "w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20";

  const tabs: { key: Tab; label: string }[] = [
    { key: "details", label: t("tab_details") },
    { key: "translations", label: t("tab_translations") },
    { key: "preview", label: t("tab_preview") },
  ];

  const frTitle = listing.translations.find((tr) => tr.locale === "fr")?.title;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-[#1a365d]">
        {frTitle ?? t("edit_listing")}
      </h1>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-[#1a365d] shadow-sm"
                : "text-[#a0aec0] hover:text-[#2d3748]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Version conflict error */}
      {state?.success === false && state.error.code === "OPTIMISTIC_LOCK_CONFLICT" && (
        <div className="mb-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
          {t("version_conflict")}
        </div>
      )}

      {state?.success === false && state.error.code !== "OPTIMISTIC_LOCK_CONFLICT" && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {state.error.message}
        </div>
      )}

      {state?.success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {t("saved_successfully")}
        </div>
      )}

      {/* Details tab */}
      {activeTab === "details" && (
        <form
          action={formAction}
          className="space-y-4 rounded-xl bg-white p-6 shadow-sm"
        >
          <input type="hidden" name="listing_id" value={listing.id} />
          <input type="hidden" name="expected_version" value={version} />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t("listing_type")}
            </label>
            <select
              name="listing_type"
              defaultValue={listing.listing_type}
              className={inputClassName}
            >
              {LISTING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`type_${type}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t("property_type")}
            </label>
            <select
              name="property_type"
              defaultValue={listing.property_type}
              className={inputClassName}
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`property_${type}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t("price")} (DZD)
            </label>
            <input
              type="number"
              name="current_price"
              min="0"
              defaultValue={listing.current_price}
              className={inputClassName}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("wilaya")}
              </label>
              <input
                type="number"
                name="wilaya_code"
                min="1"
                max="58"
                defaultValue={listing.wilaya_code}
                className={inputClassName}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("commune")}
              </label>
              <input
                type="number"
                name="commune_id"
                defaultValue={listing.commune_id ?? ""}
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t("surface")} (m²)
            </label>
            <input
              type="number"
              name="surface_m2"
              min="0"
              defaultValue={listing.surface_m2 ?? ""}
              className={inputClassName}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("rooms")}
              </label>
              <input
                type="number"
                name="rooms"
                min="0"
                step="1"
                defaultValue={listing.rooms ?? ""}
                className={inputClassName}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("bathrooms")}
              </label>
              <input
                type="number"
                name="bathrooms"
                min="0"
                step="1"
                defaultValue={listing.bathrooms ?? ""}
                className={inputClassName}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-[#1a365d] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#1a365d]/90 disabled:opacity-50"
          >
            {isPending ? t("saving") : t("save")}
          </button>
        </form>
      )}

      {/* Translations tab */}
      {activeTab === "translations" && (
        <TranslationEditor
          listingId={listing.id}
          translations={listing.translations}
        />
      )}

      {/* Preview tab */}
      {activeTab === "preview" && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#2d3748]">
            {t("preview")}
          </h2>

          {listing.cover_url && (
            <div className="mb-4 aspect-video overflow-hidden rounded-lg">
              <img
                src={listing.cover_url}
                alt={frTitle ?? ""}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <p className="mb-2 text-2xl font-bold text-[#1a365d]">
            {new Intl.NumberFormat("fr-DZ", {
              style: "currency",
              currency: "DZD",
              minimumFractionDigits: 0,
            }).format(listing.current_price)}
          </p>

          <div className="flex flex-wrap gap-2 text-sm text-[#a0aec0]">
            <span className="rounded bg-[#d4af37]/15 px-2 py-0.5 text-xs font-medium text-[#d4af37]">
              {t(`property_${listing.property_type}`)}
            </span>
            <span>{t(`type_${listing.listing_type}`)}</span>
            {listing.rooms !== null && (
              <span>{t("rooms_count", { count: listing.rooms })}</span>
            )}
            {listing.surface_m2 !== null && (
              <span>{listing.surface_m2} m²</span>
            )}
          </div>

          {listing.translations.map((tr) => (
            <div
              key={tr.locale}
              className="mt-4 border-t border-gray-100 pt-4"
              dir={tr.locale === "ar" ? "rtl" : "ltr"}
            >
              <p className="text-xs font-medium uppercase text-[#a0aec0]">
                {tr.locale.toUpperCase()}
              </p>
              <h3 className="text-lg font-semibold text-[#2d3748]">
                {tr.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{tr.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
