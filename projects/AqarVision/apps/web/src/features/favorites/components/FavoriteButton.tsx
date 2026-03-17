"use client";

import { useState, useCallback } from "react";
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
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, setIsPending] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleToggle = useCallback(async () => {
    if (isPending) return;

    const previousState = favorited;
    setFavorited(!favorited); // Optimistic update
    setHasError(false);
    setIsPending(true);

    try {
      const formData = new FormData();
      formData.set("listing_id", listingId);
      const result = await toggleFavoriteAction(null, formData);

      if (!result.success) {
        setFavorited(previousState); // Revert on failure
        setHasError(true);
        setTimeout(() => setHasError(false), 820); // Clear shake after animation
      } else {
        setFavorited(result.data.favorited); // Sync with server truth
      }
    } catch {
      setFavorited(previousState); // Revert on exception
      setHasError(true);
      setTimeout(() => setHasError(false), 820);
    } finally {
      setIsPending(false);
    }
  }, [favorited, isPending, listingId]);

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`group inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-medium transition-colors hover:border-amber-500/50 hover:bg-amber-600/5 disabled:opacity-70 ${
        hasError ? "animate-shake" : ""
      }`}
      aria-label={favorited ? t("remove") : t("my_favorites")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className={`h-5 w-5 transition-all ${
          favorited ? "scale-110 text-amber-500" : "scale-100 text-zinc-400 group-hover:text-amber-500"
        }`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
