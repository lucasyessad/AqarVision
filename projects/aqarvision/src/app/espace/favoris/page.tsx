import Link from "next/link";
import { Heart, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserFavorites } from "@/lib/queries/favorites";
import { ResultCard } from "@/components/search/result-card";
import { FavoriteButton } from "@/components/search/favorite-button";

export default async function FavorisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const favorites = user ? await getUserFavorites(user.id) : [];
  const count = favorites.length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
        {count > 0 && (
          <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-bleu-nuit text-white text-xs font-medium">
            {count}
          </span>
        )}
      </div>

      {count === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Vous n&apos;avez pas encore de favoris
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Parcourez les annonces et ajoutez vos biens préférés en favoris.
          </p>
          <Link
            href="/recherche"
            className="inline-flex items-center gap-2 px-4 py-2 bg-bleu-nuit text-white text-sm font-medium rounded-lg hover:bg-bleu-nuit/90 transition-colors"
          >
            <Search className="h-4 w-4" />
            Rechercher des biens
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((property) => (
            <ResultCard
              key={property.property_id}
              property={property}
              favoriteButton={
                <FavoriteButton
                  propertyId={property.property_id}
                  isFavorited={true}
                  isAuthenticated={true}
                />
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
