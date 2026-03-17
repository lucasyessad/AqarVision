"use client";

import { useActionState, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { saveSearchAction } from "../actions/favorites.action";

interface SaveSearchButtonProps {
  filters: Record<string, unknown>;
}

export function SaveSearchButton({ filters }: SaveSearchButtonProps) {
  const t = useTranslations("favorites");
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [, startTransition] = useTransition();
  const [state, formAction] = useActionState(saveSearchAction, null);

  const handleSubmit = (formData: FormData) => {
    startTransition(() => {
      formAction(formData);
    });
    setIsOpen(false);
    setName("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-900/20 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 transition-colors hover:bg-zinc-900/5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
          />
        </svg>
        {t("save_search")}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              {t("save_search")}
            </h3>

            {state?.success === true && (
              <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                {t("saved")}
              </p>
            )}

            <form action={handleSubmit}>
              <input type="hidden" name="filters" value={JSON.stringify(filters)} />
              <label className="mb-4 block">
                <span className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {t("search_name")}
                </span>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  placeholder={t("search_name")}
                />
              </label>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setName("");
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 transition-colors hover:bg-gray-50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
                >
                  {t("save_search")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
