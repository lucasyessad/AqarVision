"use client";

import { useActionState, useTransition, useState, useOptimistic } from "react";
import type { CollectionDto, CollectionFavoriteDto } from "../types/collections.types";
import {
  createCollectionAction,
  renameCollectionAction,
  deleteCollectionAction,
  assignFavoriteAction,
} from "../actions/collections.action";

interface CollectionsManagerProps {
  collections: CollectionDto[];
  favorites: CollectionFavoriteDto[];
}

export function CollectionsManager({ collections, favorites }: CollectionsManagerProps) {
  const [, startTransition] = useTransition();
  const [showNewForm, setShowNewForm] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [draggingFavoriteId, setDraggingFavoriteId] = useState<string | null>(null);

  const [optimisticCollections, addOptimisticCollection] = useOptimistic(
    collections,
    (state: CollectionDto[], newCollection: CollectionDto) => [newCollection, ...state]
  );

  const [createState, createAction] = useActionState(createCollectionAction, null);
  const [renameState, renameAction] = useActionState(renameCollectionAction, null);
  const [, deleteAction] = useActionState(deleteCollectionAction, null);
  const [, assignAction] = useActionState(assignFavoriteAction, null);

  const selectedFavorites = selectedCollectionId
    ? favorites.filter((f) => f.collection_id === selectedCollectionId)
    : favorites.filter((f) => !f.collection_id);

  function handleDragStart(favoriteId: string) {
    setDraggingFavoriteId(favoriteId);
  }

  function handleDrop(collectionId: string | null) {
    if (!draggingFavoriteId) return;
    const formData = new FormData();
    formData.set("favorite_id", draggingFavoriteId);
    formData.set("collection_id", collectionId ?? "null");
    startTransition(() => {
      assignAction(formData);
    });
    setDraggingFavoriteId(null);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Collections sidebar */}
      <aside className="w-full lg:w-64 shrink-0">
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-[#1a365d]">Collections</h2>
            <button
              onClick={() => setShowNewForm(true)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nouvelle
            </button>
          </div>

          {/* New collection form */}
          {showNewForm && (
            <form
              action={(formData) => {
                const name = formData.get("name") as string;
                startTransition(() => {
                  addOptimisticCollection({
                    id: "temp-" + Date.now(),
                    name,
                    created_at: new Date().toISOString(),
                    favorite_count: 0,
                  });
                  createAction(formData);
                });
                setShowNewForm(false);
              }}
              className="border-b border-gray-100 p-3"
            >
              <input
                name="name"
                type="text"
                autoFocus
                placeholder="Nom de la collection"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d]"
                required
              />
              {createState && !createState.success && (
                <p className="mt-1 text-xs text-red-500">{createState.error.message}</p>
              )}
              <div className="mt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-[#1a365d] py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1a365d]/90"
                >
                  Créer
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}

          {/* "Sans collection" bucket */}
          <button
            onClick={() => setSelectedCollectionId(null)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(null)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-start text-sm transition-colors hover:bg-gray-50 border-b border-gray-50 ${
              selectedCollectionId === null ? "bg-[#1a365d]/5 text-[#1a365d] font-medium" : "text-[#2d3748]"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 shrink-0 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span className="flex-1 truncate">Sans collection</span>
            <span className="text-xs text-[#a0aec0]">
              {favorites.filter((f) => !f.collection_id).length}
            </span>
          </button>

          {/* Collections list */}
          <ul className="py-1">
            {optimisticCollections.map((col) => (
              <li key={col.id}>
                {renamingId === col.id ? (
                  <form
                    action={(formData) => {
                      startTransition(() => renameAction(formData));
                      setRenamingId(null);
                    }}
                    className="px-3 py-2"
                  >
                    <input type="hidden" name="id" value={col.id} />
                    <input
                      name="name"
                      type="text"
                      autoFocus
                      defaultValue={col.name}
                      className="w-full rounded border border-gray-200 px-2 py-1 text-sm outline-none focus:border-[#1a365d]"
                    />
                    {renameState && !renameState.success && (
                      <p className="mt-1 text-xs text-red-500">{renameState.error.message}</p>
                    )}
                    <div className="mt-1.5 flex gap-1.5">
                      <button type="submit" className="flex-1 rounded bg-[#1a365d] py-1 text-xs text-white">OK</button>
                      <button type="button" onClick={() => setRenamingId(null)} className="flex-1 rounded border border-gray-200 py-1 text-xs text-gray-500">✕</button>
                    </div>
                  </form>
                ) : (
                  <div
                    className={`group flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedCollectionId === col.id ? "bg-[#1a365d]/5 text-[#1a365d] font-medium" : "text-[#2d3748]"
                    }`}
                    onClick={() => setSelectedCollectionId(col.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(col.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 shrink-0 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                    <span className="flex-1 truncate text-sm">{col.name}</span>
                    <span className="text-xs text-[#a0aec0]">{col.favorite_count}</span>

                    {/* Actions — visible on hover */}
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setRenamingId(col.id); }}
                        className="rounded p-0.5 text-gray-400 hover:text-[#1a365d]"
                        title="Renommer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <form
                        action={(formData) => {
                          if (!confirm(`Supprimer "${col.name}" ?`)) return;
                          startTransition(() => deleteAction(formData));
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input type="hidden" name="id" value={col.id} />
                        <button
                          type="submit"
                          className="rounded p-0.5 text-gray-400 hover:text-red-500"
                          title="Supprimer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {optimisticCollections.length === 0 && !showNewForm && (
            <p className="px-4 py-6 text-center text-xs text-[#a0aec0]">
              Aucune collection. Créez-en une pour organiser vos favoris.
            </p>
          )}
        </div>
      </aside>

      {/* Favorites in selected collection */}
      <div className="flex-1">
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[#2d3748]">
            {selectedCollectionId
              ? optimisticCollections.find((c) => c.id === selectedCollectionId)?.name ?? "Collection"
              : "Sans collection"}
          </h3>
          <span className="text-xs text-[#a0aec0]">
            ({selectedFavorites.length} favori{selectedFavorites.length !== 1 ? "s" : ""})
          </span>
        </div>

        {selectedFavorites.length === 0 ? (
          <div
            className="flex min-h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center transition-colors"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(selectedCollectionId)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mb-3 h-8 w-8 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <p className="text-sm text-[#a0aec0]">Glissez des favoris ici</p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(selectedCollectionId)}
          >
            {selectedFavorites.map((fav) => (
              <div
                key={fav.id}
                draggable
                onDragStart={() => handleDragStart(fav.id)}
                className="cursor-grab rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing active:shadow-lg active:opacity-70"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 shrink-0 text-gray-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                    </svg>
                    <p className="text-sm font-medium text-[#2d3748] line-clamp-2 min-w-0">
                      {fav.listing_title}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-[#a0aec0]">
                  Ajouté le {new Date(fav.created_at).toLocaleDateString("fr-FR")}
                </p>

                {/* Assign to collection select */}
                <form
                  action={(formData) => {
                    startTransition(() => assignAction(formData));
                  }}
                  className="mt-3"
                >
                  <input type="hidden" name="favorite_id" value={fav.id} />
                  <select
                    name="collection_id"
                    defaultValue={fav.collection_id ?? ""}
                    onChange={(e) => {
                      const formData = new FormData();
                      formData.set("favorite_id", fav.id);
                      formData.set("collection_id", e.target.value || "null");
                      startTransition(() => assignAction(formData));
                    }}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-[#2d3748] outline-none focus:border-[#1a365d]"
                  >
                    <option value="">Sans collection</option>
                    {collections.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
