"use client";

import { useActionState, useOptimistic, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toggleFavoriteAction } from "../actions/favorites.action";

interface FavoriteButtonProps {
  listingId: string;
  initialFavorited: boolean;
}

export function FavoriteButton({
  listingId,
  initialFavorited,
}: FavoriteButtonProps) {
  const t = useTranslations("favorites");
  const [, startTransition] = useTransition();
  const [state, formAction] = useActionState(toggleFavoriteAction, null);

  const currentFavorited = state?.success
    ? state.data.favorited
    : initialFavorited;

  const [optimisticFavorited, setOptimisticFavorited] =
    useOptimistic(currentFavorited);

  return (
    <form
      action={(formData) => {
        startTransition(() => {
          setOptimisticFavorited(!optimisticFavorited);
          formAction(formData);
        });
      }}
    >
      <input type="hidden" name="listing_id" value={listingId} />
      <button
        type="submit"
        className="group inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium transition-colors hover:border-amber-500/50 hover:bg-amber-500/5"
        aria-label={
          optimisticFavorited ? t("remove") : t("my_favorites")
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={optimisticFavorited ? "#f59e0b" : "none"}
          stroke={optimisticFavorited ? "#f59e0b" : "currentColor"}
          strokeWidth={2}
          className="h-5 w-5 transition-colors group-hover:stroke-amber-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </button>
    </form>
  );
}
