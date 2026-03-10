import Link from 'next/link';

export default function AgencyNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <h2 className="mt-4 text-xl font-semibold text-gray-900">
        Agence introuvable
      </h2>
      <p className="mt-2 text-gray-500">
        Cette agence n&apos;existe pas ou a été supprimée.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
