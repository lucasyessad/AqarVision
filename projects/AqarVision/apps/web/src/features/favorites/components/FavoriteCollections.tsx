"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FolderPlus, Folder, ChevronRight, MoreVertical, Pencil, Trash2 } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  count: number;
  created_at: string;
}

interface FavoriteCollectionsProps {
  collections: Collection[];
  activeCollectionId: string | null;
  onSelect: (id: string | null) => void;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function FavoriteCollections({
  collections,
  activeCollectionId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: FavoriteCollectionsProps) {
  const t = useTranslations("favorites");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreate = () => {
    if (newName.trim()) {
      onCreate(newName.trim());
      setNewName("");
      setShowCreate(false);
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      onRename(id, editName.trim());
      setEditingId(null);
    }
  };

  const totalCount = collections.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-1">
      {/* All favorites */}
      <button
        onClick={() => onSelect(null)}
        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
          activeCollectionId === null
            ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        }`}
      >
        <span className="flex items-center gap-2">
          <Folder className="h-4 w-4" />
          {t("all_favorites")}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{totalCount}</span>
      </button>

      {/* Collections */}
      {collections.map((collection) => (
        <div key={collection.id} className="relative">
          {editingId === collection.id ? (
            <div className="flex items-center gap-2 px-3 py-1.5">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename(collection.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="flex-1 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => onSelect(collection.id)}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                activeCollectionId === collection.id
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5" />
                {collection.name}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {collection.count}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === collection.id ? null : collection.id);
                  }}
                  className="rounded p-0.5 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              </div>
            </button>
          )}

          {/* Context menu */}
          {menuOpen === collection.id && (
            <div className="absolute end-2 top-full z-10 w-36 rounded-md border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
              <button
                onClick={() => {
                  setEditingId(collection.id);
                  setEditName(collection.name);
                  setMenuOpen(null);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <Pencil className="h-3.5 w-3.5" />
                {t("rename")}
              </button>
              <button
                onClick={() => {
                  onDelete(collection.id);
                  setMenuOpen(null);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("delete_collection")}
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Create new */}
      {showCreate ? (
        <div className="flex items-center gap-2 px-3 py-1.5">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") setShowCreate(false);
            }}
            placeholder={t("collection_name")}
            className="flex-1 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            autoFocus
          />
        </div>
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <FolderPlus className="h-4 w-4" />
          {t("new_collection")}
        </button>
      )}
    </div>
  );
}
