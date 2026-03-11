import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { BarChart3, TrendingUp, MapPin, Home } from 'lucide-react';

export const metadata = {
  title: 'Observatoire des prix immobiliers en Algérie',
  description:
    'Suivez les prix de l\'immobilier par wilaya en Algérie. Données en temps réel issues des annonces actives.',
};

interface WilayaStats {
  wilaya: string;
  avgPricePerSqm: number;
  totalListings: number;
  avgPrice: number;
}

export default async function PrixImmobilierPage() {
  const supabase = await createClient();

  // Fetch active sale listings with price and surface data
  const { data: salesData } = await supabase
    .from('search_properties_view')
    .select('wilaya, price, surface, type')
    .eq('transaction_type', 'sale')
    .not('wilaya', 'is', null)
    .not('surface', 'is', null)
    .gt('price', 0)
    .gt('surface', 0);

  // Aggregate stats per wilaya
  const statsMap = new Map<
    string,
    { pricesPerSqm: number[]; prices: number[]; count: number }
  >();

  if (salesData) {
    for (const item of salesData) {
      if (!item.wilaya || !item.price || !item.surface) continue;
      const key = item.wilaya;
      if (!statsMap.has(key)) {
        statsMap.set(key, { pricesPerSqm: [], prices: [], count: 0 });
      }
      const entry = statsMap.get(key)!;
      entry.pricesPerSqm.push(Math.round(item.price / item.surface));
      entry.prices.push(item.price);
      entry.count++;
    }
  }

  const wilayaStats: WilayaStats[] = Array.from(statsMap.entries())
    .map(([wilaya, data]) => ({
      wilaya,
      avgPricePerSqm: Math.round(
        data.pricesPerSqm.reduce((s, v) => s + v, 0) / data.pricesPerSqm.length
      ),
      avgPrice: Math.round(data.prices.reduce((s, v) => s + v, 0) / data.prices.length),
      totalListings: data.count,
    }))
    .sort((a, b) => b.totalListings - a.totalListings);

  const top5 = wilayaStats.slice(0, 5);
  const totalListings = wilayaStats.reduce((s, w) => s + w.totalListings, 0);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
            <BarChart3 className="h-4 w-4" />
            Données en temps réel
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Observatoire des prix immobiliers
          </h1>
          <p className="mt-3 text-base text-gray-500">
            Analyse des prix de vente par wilaya basée sur{' '}
            <span className="font-semibold text-gray-700">{totalListings.toLocaleString('fr-FR')}</span>{' '}
            annonces actives.
          </p>
        </div>

        {/* Top 5 wilaya cards */}
        {top5.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Top 5 wilayas les plus actives
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {top5.map((w, i) => (
                <div
                  key={w.wilaya}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {i + 1}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      <Home className="h-3 w-3" />
                      {w.totalListings}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 truncate">{w.wilaya}</p>
                  <p className="mt-1 text-lg font-bold text-blue-600">
                    {w.avgPricePerSqm.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-400">DZD/m²</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Full table */}
        {wilayaStats.length > 0 ? (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Prix par wilaya — Toutes les wilayas
            </h2>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 font-medium text-gray-500">#</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Wilaya</th>
                    <th className="px-6 py-3 text-right font-medium text-gray-500">
                      Prix moyen / m²
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-gray-500">
                      Prix moyen
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-gray-500">
                      Annonces actives
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {wilayaStats.map((w, i) => (
                    <tr key={w.wilaya} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-gray-900">{w.wilaya}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-blue-600">
                        {w.avgPricePerSqm.toLocaleString('fr-FR')} DZD
                      </td>
                      <td className="px-6 py-3 text-right text-gray-600">
                        {(w.avgPrice / 1_000_000).toFixed(1)} M DZD
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                          {w.totalListings.toLocaleString('fr-FR')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-gray-500">Aucune donnée disponible pour le moment</p>
            <p className="mt-1 text-sm text-gray-400">
              Les statistiques apparaîtront quand des annonces de vente seront publiées.
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/recherche?transaction_type=sale"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white
              transition hover:bg-blue-700"
          >
            <Home className="h-4 w-4" />
            Voir les biens à vendre
          </Link>
          <Link
            href="/calculateur"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700
              transition hover:bg-gray-50"
          >
            <TrendingUp className="h-4 w-4" />
            Simuler un crédit
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Données calculées en temps réel à partir des annonces publiées sur AqarVision.
          Les prix sont exprimés en dinars algériens (DZD). Dernière mise à jour : aujourd&apos;hui.
        </p>
      </div>
    </main>
  );
}
