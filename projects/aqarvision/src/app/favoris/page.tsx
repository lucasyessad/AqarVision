import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUserFavorites, getUserFavoritesCount } from '@/lib/queries/favorites';
import { ResultCard } from '@/components/search/result-card';
import { FavoriteButton } from '@/components/search/favorite-button';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mes favoris — AqarSearch',
};

export default async function FavorisPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirectTo=/favoris');

  const [favorites, count] = await Promise.all([
    getUserFavorites(user.id),
    getUserFavoritesCount(user.id),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
          <p className="mt-1 text-sm text-gray-500">
            {count} bien{count !== 1 ? 's' : ''} sauvegardé{count !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Aucun favori
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              Ajoutez des biens à vos favoris pour les retrouver facilement.
            </p>
            <Link
              href="/recherche"
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Rechercher des biens
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
