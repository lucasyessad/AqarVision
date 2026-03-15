"use client";

import { useActionState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { createAgencyAction } from "../actions/create-agency.action";
import type { ActionResult, AgencyDto } from "../types/agency.types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CreateAgencyForm() {
  const t = useTranslations("agencies");
  const locale = useLocale();
  const router = useRouter();
  const slugRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState<
    ActionResult<AgencyDto> | null,
    FormData
  >(createAgencyAction, null);

  useEffect(() => {
    if (state?.success && state.data) {
      router.push(`/${locale}/dashboard`);
    }
  }, [state, router, locale]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (slugRef.current) {
        slugRef.current.value = slugify(e.target.value);
      }
    },
    []
  );

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">
        {t("create_title")}
      </h1>

      {state?.success === false && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {state.error.message}
        </div>
      )}

      <form
        action={formAction}
        className="space-y-4 rounded-xl bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="agency-name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {t("name")}
          </label>
          <input
            id="agency-name"
            type="text"
            name="name"
            required
            minLength={2}
            onChange={handleNameChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
          />
        </div>

        <div>
          <label
            htmlFor="agency-slug"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {t("slug")}
          </label>
          <input
            id="agency-slug"
            type="text"
            name="slug"
            ref={slugRef}
            required
            minLength={3}
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
          />
          <p className="mt-1 text-xs text-gray-400">{t("slug_hint")}</p>
        </div>

        <div>
          <label
            htmlFor="agency-description"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {t("description")}
          </label>
          <textarea
            id="agency-description"
            name="description"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="agency-phone"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {t("phone")}
            </label>
            <input
              id="agency-phone"
              type="tel"
              name="phone"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
            />
          </div>

          <div>
            <label
              htmlFor="agency-email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {t("email")}
            </label>
            <input
              id="agency-email"
              type="email"
              name="email"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-white transition-colors hover:bg-zinc-900/90 disabled:opacity-50"
        >
          {isPending ? t("creating") : t("create_button")}
        </button>
      </form>
    </div>
  );
}
