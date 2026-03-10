import Link from 'next/link';
import { getTranslations } from '@/lib/i18n';

export default function HomePage() {
  const t = getTranslations('fr');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <h1 className="text-5xl font-bold tracking-tight text-gray-900">
        Aqar<span className="text-blue-600">Vision</span>
      </h1>
      <p className="mt-4 max-w-md text-center text-lg text-gray-600">
        {t('home.subtitle')}
      </p>
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/recherche"
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          {t('home.search')}
        </Link>
        <Link
          href="/agence/demo"
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          {t('home.demo')}
        </Link>
        <Link
          href="/pricing"
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          {t('home.pricing')}
        </Link>
      </div>
    </div>
  );
}
