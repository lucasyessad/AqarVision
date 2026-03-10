import { SearchX } from 'lucide-react';
import Link from 'next/link';

interface ResultEmptyStateProps {
  hasFilters: boolean;
}

export function ResultEmptyState({ hasFilters }: ResultEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <SearchX className="mb-4 h-16 w-16 text-gray-300" />
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        Aucun résultat trouvé
      </h3>
      <p className="mb-6 max-w-md text-sm text-gray-500">
        {hasFilters
          ? 'Essayez de modifier vos filtres ou d\'élargir votre recherche pour trouver plus de biens.'
          : 'Il n\'y a pas encore de biens disponibles. Revenez bientôt !'}
      </p>
      {hasFilters && (
        <Link
          href="/recherche"
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Réinitialiser la recherche
        </Link>
      )}
    </div>
  );
}
