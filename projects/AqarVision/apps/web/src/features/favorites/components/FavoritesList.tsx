"use client";

import { useActionState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toggleFavoriteAction } from "../actions/favorites.action";
import type { FavoriteDto } from "../types/favorites.types";

interface FavoritesListProps {
  favorites: (FavoriteDto & { listing_title: string })[];
}

export function FavoritesList({ favorites }: FavoritesListProps) {
  const t = useTranslations("favorites");

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="mb-4 h-12 w-12 text-zinc-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
        <p className="text-sm text-zinc-400">{t("no_favorites")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((fav) => (
        <FavoriteCard key={fav.id} favorite={fav} />
      ))}
    </div>
  );
}

function FavoriteCard({
  favorite,
}: {
  favorite: FavoriteDto & { listing_title: string };
}) {
  const t = useTranslations("favorites");
  const [, startTransition] = useTransition();
  const [, formAction] = useActionState(toggleFavoriteAction, null);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-800 line-clamp-2">
          {favorite.listing_title}
        </h3>
        <form
          action={(formData) => {
            startTransition(() => {
              formAction(formData);
            });
          }}
        >
          <input type="hidden" name="listing_id" value={favorite.listing_id} />
          <button
            type="submit"
            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            {t("remove")}
          </button>
        </form>
      </div>
      <p className="text-xs text-zinc-400">
        {new Date(favorite.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}
