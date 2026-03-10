'use client';

import { Heart } from 'lucide-react';
import { useTransition } from 'react';
import { addFavorite, removeFavorite } from '@/lib/actions/favorites';

interface FavoriteButtonProps {
  propertyId: string;
  isFavorited: boolean;
  isAuthenticated: boolean;
}

export function FavoriteButton({ propertyId, isFavorited, isAuthenticated }: FavoriteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!isAuthenticated) {
      window.location.href = `/login?redirectTo=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    startTransition(async () => {
      if (isFavorited) {
        await removeFavorite(propertyId);
      } else {
        await addFavorite(propertyId);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`rounded-full p-2 transition-colors ${
        isFavorited
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500'
      } ${isPending ? 'opacity-50' : ''}`}
      aria-label={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
    </button>
  );
}
