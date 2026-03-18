"use client";

import { useState, useTransition } from "react";
import { FolderPlus, FolderOpen, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  createCollectionAction,
  moveToCollectionAction,
} from "../actions/favorite.action";
import type { FavoriteCollection } from "../types/favorites.types";

interface CollectionManagerProps {
  listingId: string;
  favoriteId: string;
  collections: FavoriteCollection[];
  currentCollectionId?: string | null;
  open: boolean;
  onClose: () => void;
  onCollectionCreated?: (collection: FavoriteCollection) => void;
  onMoved?: () => void;
}

export function CollectionManager({
  listingId,
  favoriteId,
  collections,
  currentCollectionId,
  open,
  onClose,
  onCollectionCreated,
  onMoved,
}: CollectionManagerProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    if (!newName.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await createCollectionAction(newName.trim());
      if (result.success) {
        setNewName("");
        setShowCreate(false);
        onCollectionCreated?.(result.data);
      } else {
        setError(result.message);
      }
    });
  }

  function handleMove(collectionId: string | null) {
    startTransition(async () => {
      const result = await moveToCollectionAction(favoriteId, collectionId);
      if (result.success) {
        onMoved?.();
        onClose();
      }
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Gérer la collection"
      description="Déplacez cette annonce dans une collection"
    >
      <div className="space-y-3">
        {/* Remove from collection option */}
        {currentCollectionId && (
          <button
            type="button"
            onClick={() => handleMove(null)}
            disabled={isPending}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-start",
              "text-sm text-stone-600 dark:text-stone-400",
              "hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-fast",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
              "disabled:opacity-50"
            )}
          >
            <FolderOpen size={18} className="shrink-0 text-stone-400 dark:text-stone-500" />
            <span>Retirer de la collection</span>
          </button>
        )}

        {/* Collection list */}
        {collections.map((col) => {
          const isCurrent = col.id === currentCollectionId;
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => handleMove(col.id)}
              disabled={isPending || isCurrent}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-start",
                "transition-colors duration-fast",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
                "disabled:opacity-50",
                isCurrent
                  ? "bg-teal-50 dark:bg-teal-950/50"
                  : "hover:bg-stone-50 dark:hover:bg-stone-800"
              )}
            >
              <FolderOpen
                size={18}
                className={cn(
                  "shrink-0",
                  isCurrent
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-stone-400 dark:text-stone-500"
                )}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium truncate",
                    isCurrent
                      ? "text-teal-700 dark:text-teal-300"
                      : "text-stone-700 dark:text-stone-300"
                  )}
                >
                  {col.name}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {col.listings_count} annonce{col.listings_count !== 1 ? "s" : ""}
                </p>
              </div>
              {isCurrent && (
                <Check size={16} className="shrink-0 text-teal-600 dark:text-teal-400" />
              )}
            </button>
          );
        })}

        {/* Create new */}
        {showCreate ? (
          <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-700">
            <Input
              placeholder="Nom de la collection"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              error={error ?? undefined}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreate(false);
                  setNewName("");
                  setError(null);
                }}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreate}
                loading={isPending}
                disabled={!newName.trim()}
              >
                Créer
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-start",
              "text-sm font-medium text-teal-700 dark:text-teal-400",
              "hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors duration-fast",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
              "border-t border-stone-200 dark:border-stone-700 pt-3 mt-1"
            )}
          >
            <FolderPlus size={18} className="shrink-0" />
            <span>Nouvelle collection</span>
          </button>
        )}
      </div>
    </Dialog>
  );
}
