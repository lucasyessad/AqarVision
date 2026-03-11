import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, TrendingUp, ArrowRight } from 'lucide-react';
import { PriceEstimator } from '@/components/property/price-estimator';

export const metadata: Metadata = {
  title: 'Estimer le prix de votre bien — AqarVision',
  description:
    'Obtenez une estimation gratuite basée sur les biens similaires publiés sur AqarVision. Prix médian, fourchette et indice de confiance.',
};

export default function EstimerPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navbar */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg text-primary-900">AqarVision</span>
          </Link>
          <nav className="ml-auto flex items-center gap-6">
            <Link href="/recherche" className="text-body-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              Recherche
            </Link>
            <Link href="/pricing" className="text-body-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              Tarifs
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-body-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1440px] mx-auto px-6 pt-12 pb-8">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-caption font-medium mb-4">
            <TrendingUp className="h-3.5 w-3.5" />
            Estimation gratuite
          </div>
          <h1 className="text-heading-lg text-neutral-900 mb-3">
            Estimer le prix de votre bien
          </h1>
          <p className="text-body-md text-neutral-600">
            Obtenez une estimation basée sur les biens similaires publiés sur AqarVision.
            Analyse instantanée par superficie, type et localisation.
          </p>
        </div>

        {/* Estimator */}
        <PriceEstimator />

        {/* Disclaimer */}
        <p className="text-caption text-neutral-400 text-center mt-6 max-w-lg mx-auto">
          Cette estimation est indicative et basée sur les annonces disponibles sur AqarVision.
          Pour une évaluation précise, consultez un agent immobilier agréé.
        </p>
      </section>

      {/* CTA section */}
      <section className="max-w-[1440px] mx-auto px-6 pb-16">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="text-body-sm font-semibold text-neutral-900">
              Vous souhaitez publier votre bien ?
            </p>
            <p className="text-body-sm text-neutral-500 mt-0.5">
              Rejoignez les agences partenaires et publiez vos annonces dès aujourd&apos;hui.
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-body-sm font-medium rounded-xl transition-colors"
          >
            Démarrer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
