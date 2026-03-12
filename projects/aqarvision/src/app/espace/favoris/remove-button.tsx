"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { HeartOff } from "lucide-react";
import { removeFavorite } from "@/lib/actions/favorites";

export function RemoveFavoriteButton({ propertyId }: { propertyId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleRemove() {
    startTransition(async () => {
      await removeFavorite(propertyId);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
      title="Retirer des favoris"
    >
      <HeartOff className="h-4 w-4" />
    </button>
  );
}
