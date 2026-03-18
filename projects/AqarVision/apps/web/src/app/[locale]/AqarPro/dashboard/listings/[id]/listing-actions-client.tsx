"use client";

import { useTransition } from "react";
import { Pause, Send, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  publishListingAction,
  pauseListingAction,
  deleteListingAction,
} from "@/features/listings/actions/listing.action";

interface Props {
  listingId: string;
  agencyId: string;
  currentStatus: string;
}

export function ListingActionsClient({ listingId, agencyId, currentStatus }: Props) {
  const t = useTranslations("listing.actions");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handlePublish() {
    startTransition(async () => {
      await publishListingAction(listingId, agencyId);
      router.refresh();
    });
  }

  function handlePause() {
    startTransition(async () => {
      await pauseListingAction(listingId, agencyId);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm(t("confirmDelete"))) return;
    startTransition(async () => {
      await deleteListingAction(listingId, agencyId);
      router.push("/AqarPro/dashboard/listings");
    });
  }

  const btnBase =
    "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors duration-fast disabled:opacity-50";
  const btnSecondary =
    "border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800";
  const btnDanger =
    "border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950";

  return (
    <div className="flex items-center gap-2">
      {(currentStatus === "draft" || currentStatus === "paused") && (
        <button
          type="button"
          onClick={handlePublish}
          disabled={isPending}
          className={`${btnBase} ${btnSecondary}`}
        >
          <Send className="h-4 w-4" />
          {t("publish")}
        </button>
      )}

      {currentStatus === "published" && (
        <button
          type="button"
          onClick={handlePause}
          disabled={isPending}
          className={`${btnBase} ${btnSecondary}`}
        >
          <Pause className="h-4 w-4" />
          {t("pause")}
        </button>
      )}

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className={`${btnBase} ${btnDanger}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
