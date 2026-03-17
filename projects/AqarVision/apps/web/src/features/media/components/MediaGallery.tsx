"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { reorderMediaAction, setCoverAction, deleteMediaAction } from "../actions/manage-media.action";
import { MediaPreview } from "./MediaPreview";
import type { MediaDto } from "../types/media.types";

interface MediaGalleryProps {
  listingId: string;
  media: MediaDto[];
  onMediaChange?: (media: MediaDto[]) => void;
}

export function MediaGallery({
  listingId,
  media,
  onMediaChange,
}: MediaGalleryProps) {
  const t = useTranslations("media");
  const [items, setItems] = useState<MediaDto[]>(media);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const updateItems = useCallback(
    (newItems: MediaDto[]) => {
      setItems(newItems);
      onMediaChange?.(newItems);
    },
    [onMediaChange]
  );

  /* ---- Drag & Drop ---- */

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    []
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === dropIndex) {
        setDraggedIndex(null);
        return;
      }

      const reordered = [...items];
      const [moved] = reordered.splice(draggedIndex, 1);
      if (!moved) {
        setDraggedIndex(null);
        return;
      }
      reordered.splice(dropIndex, 0, moved);

      updateItems(reordered);
      setDraggedIndex(null);

      await reorderMediaAction({
        listing_id: listingId,
        ordered_media_ids: reordered.map((m) => m.id),
      });
    },
    [draggedIndex, items, listingId, updateItems]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  /* ---- Actions ---- */

  const handleSetCover = useCallback(
    async (mediaId: string) => {
      const result = await setCoverAction({
        listing_id: listingId,
        media_id: mediaId,
      });

      if (result.success) {
        const updated = items.map((m) => ({
          ...m,
          is_cover: m.id === mediaId,
        }));
        updateItems(updated);
      }
    },
    [items, listingId, updateItems]
  );

  const handleDelete = useCallback(
    async (mediaId: string) => {
      const result = await deleteMediaAction({ media_id: mediaId });

      if (result.success) {
        const filtered = items.filter((m) => m.id !== mediaId);
        updateItems(filtered);
      }

      setConfirmDeleteId(null);
    },
    [items, updateItems]
  );

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800 p-8">
        <p className="text-sm text-zinc-400">{t("no_media")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              group relative aspect-square cursor-grab overflow-hidden
              rounded-lg bg-gray-100 transition-opacity
              ${draggedIndex === index ? "opacity-40" : "opacity-100"}
            `}
          >
            {/* Thumbnail */}
            <button
              type="button"
              onClick={() => setPreviewIndex(index)}
              className="h-full w-full focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
            >
              <img
                src={item.url}
                alt={`${t("image")} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>

            {/* Cover badge */}
            {item.is_cover && (
              <div className="absolute inset-block-start-2 inset-inline-start-2 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5">
                <svg
                  className="h-3 w-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-[10px] font-semibold text-white">
                  {t("cover")}
                </span>
              </div>
            )}

            {/* Hover overlay with actions */}
            <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              {/* Set as cover button */}
              {!item.is_cover && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetCover(item.id);
                  }}
                  className="rounded bg-white/90 px-2 py-1 text-[10px] font-medium text-zinc-800 dark:text-zinc-200 transition-colors hover:bg-white dark:bg-zinc-900"
                >
                  {t("set_as_cover")}
                </button>
              )}

              {/* Delete button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDeleteId(item.id);
                }}
                className="ms-auto rounded-full bg-red-500/90 p-1.5 text-white transition-colors hover:bg-red-600"
                aria-label={t("delete")}
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-xl">
            <h3 className="mb-2 text-base font-semibold text-zinc-800 dark:text-zinc-200">
              {t("delete_confirm_title")}
            </h3>
            <p className="mb-4 text-sm text-zinc-400">
              {t("delete_confirm_message")}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 transition-colors hover:bg-gray-100"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewIndex !== null && (
        <MediaPreview
          media={items}
          initialIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </>
  );
}
