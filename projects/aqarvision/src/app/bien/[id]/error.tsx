'use client';

import Link from 'next/link';

export default function BienError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <h2 className="mb-2 text-xl font-bold text-gray-900">Erreur</h2>
      <p className="mb-6 text-sm text-gray-500">
        {error.message || 'Impossible de charger ce bien.'}
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Réessayer
        </button>
        <Link
          href="/recherche"
          className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Retour à la recherche
        </Link>
      </div>
    </div>
  );
}
