import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { MortgageCalculator } from '@/components/property/mortgage-calculator';

export const metadata = {
  title: 'Calculateur de crédit immobilier',
  description:
    'Simulez votre crédit immobilier en quelques secondes. Calculez vos mensualités, le coût total et les intérêts.',
};

export default function CalculateurPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
            <TrendingUp className="h-4 w-4" />
            Simulation gratuite
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Calculateur de crédit immobilier
          </h1>
          <p className="mt-3 text-base text-gray-500">
            Simulez votre crédit immobilier en quelques secondes et estimez vos mensualités.
          </p>
        </div>

        {/* Calculator */}
        <MortgageCalculator />

        {/* CTA */}
        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center">
          <p className="text-sm font-medium text-blue-900">
            Vous cherchez à estimer la valeur d&apos;un bien ?
          </p>
          <p className="mt-1 text-sm text-blue-700">
            Notre outil d&apos;estimation vous donne une valeur marchande en temps réel.
          </p>
          <Link
            href="/estimer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white
              transition hover:bg-blue-700"
          >
            Estimer mon bien
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Les résultats affichés sont des estimations indicatives. Les taux réels peuvent varier
          selon votre banque, profil et situation. Contactez votre conseiller bancaire pour une
          offre personnalisée.
        </p>
      </div>
    </main>
  );
}
