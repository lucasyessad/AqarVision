'use client';

export default function RechercheError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <h2 className="mb-2 text-xl font-bold text-gray-900">Erreur de recherche</h2>
      <p className="mb-6 text-sm text-gray-500">
        {error.message || 'Une erreur est survenue lors de la recherche.'}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        Réessayer
      </button>
    </div>
  );
}
