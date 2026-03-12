"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { clearSearchHistory } from "@/lib/actions/search-history";

export function ClearHistoryButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClear() {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer tout votre historique de recherche ?"
    );
    if (!confirmed) return;

    startTransition(async () => {
      await clearSearchHistory();
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClear}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Tout effacer
    </button>
  );
}
