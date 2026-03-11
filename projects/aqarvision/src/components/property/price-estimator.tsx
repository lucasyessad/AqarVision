'use client';

import { useState } from 'react';
import { TrendingUp, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { estimatePrice } from '@/lib/actions/ai-pricing';

const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra',
  'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret',
  'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda',
  'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem',
  "M'Sila", 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi',
  'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt',
  'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla',
  'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane',
];

const PROPERTY_TYPES = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'villa', label: 'Villa' },
  { value: 'maison', label: 'Maison' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'studio', label: 'Studio' },
  { value: 'terrain', label: 'Terrain' },
  { value: 'bureau', label: 'Bureau' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'entrepot', label: 'Entrepôt' },
];

interface EstimateResult {
  estimated_price: number;
  price_per_sqm: number;
  price_range: { min: number; max: number };
  comparables_count: number;
  confidence: 'low' | 'medium' | 'high';
}

interface PriceEstimatorProps {
  defaultValues?: {
    type?: string;
    surface?: number;
    wilaya?: string;
  };
  compact?: boolean;
}

const confidenceConfig = {
  high:   { label: 'Élevée',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  medium: { label: 'Moyenne', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  low:    { label: 'Faible',  color: 'bg-red-100 text-red-700 border-red-200' },
} as const;

function formatDZD(value: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function PriceEstimator({ defaultValues, compact = false }: PriceEstimatorProps) {
  const [type, setType] = useState(defaultValues?.type ?? '');
  const [transactionType, setTransactionType] = useState<'sale' | 'rent'>('sale');
  const [wilaya, setWilaya] = useState(defaultValues?.wilaya ?? '');
  const [surface, setSurface] = useState(defaultValues?.surface?.toString() ?? '');
  const [rooms, setRooms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEstimate = async () => {
    setError(null);
    setResult(null);

    if (!type || !wilaya || !surface) {
      setError('Veuillez renseigner le type, la wilaya et la surface.');
      return;
    }

    const surfaceNum = parseFloat(surface);
    if (isNaN(surfaceNum) || surfaceNum <= 0) {
      setError('Surface invalide.');
      return;
    }

    setLoading(true);
    try {
      const res = await estimatePrice({
        type,
        transaction_type: transactionType,
        wilaya,
        surface: surfaceNum,
        rooms: rooms ? parseInt(rooms, 10) : undefined,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setResult(res as EstimateResult);
      }
    } catch {
      setError('Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const selectClass =
    'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-body-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 appearance-none';
  const inputClass =
    'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-body-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20';
  const labelClass = 'block text-body-sm font-medium text-neutral-700 mb-1.5';

  return (
    <div className={compact ? '' : 'max-w-2xl mx-auto'}>
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Form */}
        <div className={compact ? 'p-4' : 'p-6'}>
          <div className={`grid gap-4 ${compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {/* Type de bien */}
            <div>
              <label htmlFor="est-type" className={labelClass}>Type de bien</label>
              <select
                id="est-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={selectClass}
              >
                <option value="">Sélectionner…</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Transaction */}
            <div>
              <label className={labelClass}>Transaction</label>
              <div className="flex rounded-lg border border-neutral-300 overflow-hidden h-[42px]">
                <button
                  type="button"
                  onClick={() => setTransactionType('sale')}
                  className={[
                    'flex-1 text-body-sm font-medium transition-colors',
                    transactionType === 'sale'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50',
                  ].join(' ')}
                >
                  Vente
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType('rent')}
                  className={[
                    'flex-1 text-body-sm font-medium transition-colors border-l border-neutral-300',
                    transactionType === 'rent'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50',
                  ].join(' ')}
                >
                  Location
                </button>
              </div>
            </div>

            {/* Wilaya */}
            <div>
              <label htmlFor="est-wilaya" className={labelClass}>Wilaya</label>
              <select
                id="est-wilaya"
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className={selectClass}
              >
                <option value="">Sélectionner…</option>
                {WILAYAS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Surface */}
            <div>
              <label htmlFor="est-surface" className={labelClass}>Surface (m²)</label>
              <input
                id="est-surface"
                type="number"
                min={1}
                max={10000}
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                placeholder="Ex: 85"
                className={inputClass}
              />
            </div>

            {/* Pièces (optionnel) */}
            {!compact && (
              <div>
                <label htmlFor="est-rooms" className={labelClass}>
                  Nombre de pièces <span className="text-neutral-400 font-normal">(optionnel)</span>
                </label>
                <input
                  id="est-rooms"
                  type="number"
                  min={1}
                  max={20}
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  placeholder="Ex: 3"
                  className={inputClass}
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleEstimate}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-body-sm font-medium rounded-xl transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Calcul en cours…
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                Estimer le prix
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-body-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="border-t border-neutral-100 bg-neutral-50/60 p-6 space-y-4">
            {/* Estimated price */}
            <div className="text-center">
              <p className="text-caption text-neutral-500 uppercase tracking-wide mb-1">
                Estimation
              </p>
              <p className="text-4xl font-bold text-neutral-900 font-display">
                {formatDZD(result.estimated_price)}
              </p>
              <p className="text-body-sm text-neutral-500 mt-1">
                ~{formatDZD(result.price_per_sqm)}/m²
              </p>
            </div>

            {/* Range */}
            <div className="flex items-center gap-2 justify-center">
              <span className="text-body-sm text-neutral-600">Entre</span>
              <span className="font-semibold text-neutral-900">{formatDZD(result.price_range.min)}</span>
              <span className="text-neutral-400">et</span>
              <span className="font-semibold text-neutral-900">{formatDZD(result.price_range.max)}</span>
            </div>

            {/* Confidence + comparables */}
            <div className="flex items-center justify-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${confidenceConfig[result.confidence].color}`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Confiance: {confidenceConfig[result.confidence].label}
              </span>
              <span className="text-caption text-neutral-400">
                Basé sur {result.comparables_count} bien{result.comparables_count > 1 ? 's' : ''} comparables
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
