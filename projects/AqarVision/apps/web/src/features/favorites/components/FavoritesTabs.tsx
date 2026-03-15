"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FavoritesList } from "./FavoritesList";
import { deleteSavedSearchAction } from "../actions/favorites.action";
import type { FavoriteDto, NoteDto, SavedSearchDto } from "../types/favorites.types";

type Tab = "favorites" | "notes" | "searches";

interface FavoritesTabsProps {
  favorites: (FavoriteDto & { listing_title: string })[];
  notes: (NoteDto & { listing_title: string })[];
  searches: SavedSearchDto[];
  defaultTab?: Tab;
}

export function FavoritesTabs({
  favorites,
  notes,
  searches,
  defaultTab = "favorites",
}: FavoritesTabsProps) {
  const t = useTranslations("favorites");
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "favorites", label: t("my_favorites"), count: favorites.length },
    { key: "notes", label: t("my_notes"), count: notes.length },
    { key: "searches", label: t("saved_searches"), count: searches.length },
  ];

  return (
    <>
      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-white p-1 shadow-sm">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            type="button"
            onClick={() => setActiveTab(tabItem.key)}
            className={`flex-1 rounded-md px-4 py-2.5 text-center text-sm font-medium transition-colors ${
              activeTab === tabItem.key
                ? "bg-zinc-900 text-white"
                : "text-zinc-800 hover:bg-gray-100"
            }`}
          >
            {tabItem.label}
            {tabItem.count > 0 && (
              <span
                className={`ms-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-xs font-semibold ${
                  activeTab === tabItem.key
                    ? "bg-white/20 text-white"
                    : "bg-zinc-900/10 text-zinc-900"
                }`}
              >
                {tabItem.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "favorites" && (
        <FavoritesList favorites={favorites} />
      )}

      {activeTab === "notes" && (
        <div>
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mb-4 h-12 w-12 text-zinc-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
              <p className="text-sm text-zinc-400">{t("no_notes")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <h3 className="mb-1 text-sm font-semibold text-zinc-800">
                    {note.listing_title}
                  </h3>
                  <p className="mb-2 text-sm text-zinc-800 whitespace-pre-wrap">
                    {note.body}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "searches" && (
        <div>
          {searches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mb-4 h-12 w-12 text-zinc-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                />
              </svg>
              <p className="text-sm text-zinc-400">
                {t("no_saved_searches")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {searches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-800">
                      {search.name}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {Object.keys(search.filters).length} filtre(s) &middot;{" "}
                      {new Date(search.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <form action={(formData) => { deleteSavedSearchAction(null, formData); }}>
                    <input type="hidden" name="id" value={search.id} />
                    <button
                      type="submit"
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      {t("remove")}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
