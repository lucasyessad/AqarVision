"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { FolderOpen, FolderPlus, Heart, MoreVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/features/favorites/components/FavoriteButton";
import { CollectionManager } from "@/features/favorites/components/CollectionManager";
import { createCollectionAction } from "@/features/favorites/actions/favorite.action";
import type { Favorite, FavoriteCollection } from "@/features/favorites/types/favorites.types";
import Link from "next/link";

interface FavorisContentProps {
  favorites: Favorite[];
  collections: FavoriteCollection[];
  activeCollectionId: string | null;
  userId: string;
}

function ListingCard({ favorite }: { favorite: Favorite }) {
  const { listing } = favorite;
  const [showCollectionManager, setShowCollectionManager] = useState(false);

  return (
    <div className="group relative rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden transition-shadow duration-normal hover:shadow-card-hover">
      {/* Image */}
      <Link
        href={`/annonce/${listing.slug}`}
        className="block aspect-[16/10] relative bg-stone-100 dark:bg-stone-800"
      >
        {listing.cover_url ? (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${listing.cover_url})` }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Heart size={24} className="text-stone-300 dark:text-stone-600" />
          </div>
        )}

        {/* Favorite button */}
        <div className="absolute top-2 end-2">
          <FavoriteButton listingId={listing.id} initialFavorited />
        </div>

        {/* Type badge */}
        <div className="absolute bottom-2 start-2">
          <Badge
            variant={
              listing.listing_type === "sale"
                ? "listing-sale"
                : listing.listing_type === "rent"
                ? "listing-rent"
                : "listing-vacation"
            }
            size="sm"
          >
            {listing.listing_type === "sale"
              ? "Vente"
              : listing.listing_type === "rent"
              ? "Location"
              : "Vacances"}
          </Badge>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-lg font-bold text-stone-900 dark:text-stone-100">
            {new Intl.NumberFormat("fr-DZ").format(listing.price)}{" "}
            <span className="text-sm font-normal text-stone-500 dark:text-stone-400">
              {listing.currency}
            </span>
          </p>
          <button
            type="button"
            onClick={() => setShowCollectionManager(true)}
            className={cn(
              "shrink-0 rounded-md p-1 text-stone-400 dark:text-stone-500",
              "hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors duration-fast",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400"
            )}
            aria-label="Gérer la collection"
          >
            <FolderOpen size={16} />
          </button>
        </div>
        <p className="text-sm text-stone-700 dark:text-stone-300 truncate">
          {listing.title}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {listing.commune_name}, {listing.wilaya_name}
          {listing.area_m2 > 0 && ` — ${listing.area_m2} m²`}
          {listing.rooms && ` — ${listing.rooms} p.`}
        </p>
      </div>

      {showCollectionManager && (
        <CollectionManager
          listingId={listing.id}
          favoriteId={favorite.id}
          collections={[]}
          currentCollectionId={favorite.collection_id}
          open={showCollectionManager}
          onClose={() => setShowCollectionManager(false)}
        />
      )}
    </div>
  );
}

export function FavorisContent({
  favorites,
  collections,
  activeCollectionId,
  userId,
}: FavorisContentProps) {
  const tEmpty = useTranslations("common.empty");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreateCollection() {
    if (!newCollectionName.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await createCollectionAction(newCollectionName.trim());
      if (result.success) {
        setNewCollectionName("");
        setShowCreateDialog(false);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <>
      {/* Collection tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Link
          href="/AqarChaab/espace/favoris"
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-fast",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
            !activeCollectionId
              ? "bg-teal-600 dark:bg-teal-500 text-white"
              : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
          )}
        >
          Tous
        </Link>
        {collections.map((col) => (
          <Link
            key={col.id}
            href={`/AqarChaab/espace/favoris?collection=${col.id}`}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-fast",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
              activeCollectionId === col.id
                ? "bg-teal-600 dark:bg-teal-500 text-white"
                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
            )}
          >
            {col.name}
            <span className="ms-1.5 text-xs opacity-70">
              {col.listings_count}
            </span>
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setShowCreateDialog(true)}
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
            "border border-dashed border-stone-300 dark:border-stone-600",
            "text-stone-500 dark:text-stone-400",
            "hover:border-stone-400 dark:hover:border-stone-500 hover:text-stone-700 dark:hover:text-stone-300",
            "transition-colors duration-fast",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400"
          )}
        >
          <FolderPlus size={14} />
          Collection
        </button>
      </div>

      {/* Favorites grid */}
      {favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={tEmpty("noFavorites")}
          description={
            activeCollectionId
              ? "Cette collection est vide."
              : "Sauvegardez vos annonces préférées pour les retrouver facilement."
          }
          action={
            <Button variant="primary" size="sm" onClick={() => {}}>
              Explorer les annonces
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => (
            <ListingCard key={fav.id} favorite={fav} />
          ))}
        </div>
      )}

      {/* Create collection dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setNewCollectionName("");
          setError(null);
        }}
        title="Nouvelle collection"
        description="Créez une collection pour organiser vos favoris."
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCreateDialog(false);
                setNewCollectionName("");
                setError(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateCollection}
              loading={isPending}
              disabled={!newCollectionName.trim()}
            >
              Créer
            </Button>
          </>
        }
      >
        <Input
          label="Nom de la collection"
          placeholder="Ex: Appartements Alger"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreateCollection();
          }}
          error={error ?? undefined}
          autoFocus
        />
      </Dialog>
    </>
  );
}
