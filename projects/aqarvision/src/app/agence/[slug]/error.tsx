'use client';

export default function AgencyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-bold text-gray-900">
        Une erreur est survenue
      </h1>
      <p className="mt-2 text-gray-500">
        Impossible de charger cette page. Veuillez réessayer.
      </p>
      <button
        onClick={reset}
        className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Réessayer
      </button>
    </div>
  );
}
