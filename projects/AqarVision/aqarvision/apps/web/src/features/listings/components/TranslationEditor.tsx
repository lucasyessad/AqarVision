"use client";

import { useState, useActionState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { upsertTranslationAction } from "../actions/translation.action";
import type { ActionResult, TranslationDto } from "../types/listing.types";
import { LOCALES, type Locale } from "../schemas/listing.schema";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface TranslationEditorProps {
  listingId: string;
  translations: TranslationDto[];
}

export function TranslationEditor({
  listingId,
  translations,
}: TranslationEditorProps) {
  const t = useTranslations("listings");
  const [activeLocale, setActiveLocale] = useState<Locale>("fr");
  const [slugValue, setSlugValue] = useState(() => {
    const existing = translations.find((tr) => tr.locale === activeLocale);
    return existing?.slug ?? "";
  });

  const [state, formAction, isPending] = useActionState<
    ActionResult<TranslationDto> | null,
    FormData
  >(upsertTranslationAction, null);

  const existing = translations.find((tr) => tr.locale === activeLocale);
  const filledLocales = new Set(translations.map((tr) => tr.locale));

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSlugValue(slugify(e.target.value));
    },
    []
  );

  function handleLocaleChange(locale: Locale) {
    setActiveLocale(locale);
    const trans = translations.find((tr) => tr.locale === locale);
    setSlugValue(trans?.slug ?? "");
  }

  const inputClassName =
    "w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20";

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      {/* Locale tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        {LOCALES.map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => handleLocaleChange(locale)}
            className={`relative flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeLocale === locale
                ? "bg-white text-[#1a365d] shadow-sm"
                : "text-[#a0aec0] hover:text-[#2d3748]"
            }`}
          >
            {locale.toUpperCase()}
            {/* Filled/empty indicator */}
            <span
              className={`absolute inset-block-start-1 inset-inline-end-1 h-2 w-2 rounded-full ${
                filledLocales.has(locale) ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      {state?.success === false && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {state.error.message}
        </div>
      )}

      {state?.success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {t("translation_saved")}
        </div>
      )}

      <form
        action={formAction}
        className="space-y-4"
        dir={activeLocale === "ar" ? "rtl" : "ltr"}
      >
        <input type="hidden" name="listing_id" value={listingId} />
        <input type="hidden" name="locale" value={activeLocale} />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t("title")}
          </label>
          <input
            key={activeLocale}
            type="text"
            name="title"
            minLength={3}
            required
            defaultValue={existing?.title ?? ""}
            onChange={handleTitleChange}
            className={inputClassName}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t("description")}
          </label>
          <textarea
            key={activeLocale}
            name="description"
            rows={5}
            minLength={10}
            required
            defaultValue={existing?.description ?? ""}
            className={inputClassName}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t("slug")}
          </label>
          <input
            type="text"
            name="slug"
            minLength={3}
            required
            value={slugValue}
            onChange={(e) => setSlugValue(e.target.value)}
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            className={`${inputClassName} font-mono text-sm`}
            dir="ltr"
          />
          <p className="mt-1 text-xs text-[#a0aec0]">{t("slug_hint")}</p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-[#1a365d] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#1a365d]/90 disabled:opacity-50"
        >
          {isPending ? t("saving") : t("save_translation")}
        </button>
      </form>
    </div>
  );
}
