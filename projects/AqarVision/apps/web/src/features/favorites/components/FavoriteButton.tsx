"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleFavoriteAction } from "../actions/favorite.action";

interface FavoriteButtonProps {
  listingId: string;
  initialFavorited?: boolean;
  className?: string;
}

export function FavoriteButton({
  listingId,
  initialFavorited = false,
  className,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    // Optimistic update
    setFavorited((prev) => !prev);

    startTransition(async () => {
      const result = await toggleFavoriteAction(listingId);
      if (result.success) {
        setFavorited(result.data.favorited);
      } else {
        // Revert optimistic update
        setFavorited((prev) => !prev);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle();
      }}
      disabled={isPending}
      aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={favorited}
      className={cn(
        "rounded-full p-2 transition-colors duration-fast",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
        favorited
          ? "bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
          : "bg-white/80 dark:bg-stone-900/80 text-stone-400 dark:text-stone-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-stone-900",
        "backdrop-blur-sm",
        "disabled:opacity-50",
        className
      )}
    >
      <Heart
        size={18}
        className={cn(
          "transition-transform duration-fast",
          favorited && "fill-current scale-110"
        )}
      />
    </button>
  );
}
