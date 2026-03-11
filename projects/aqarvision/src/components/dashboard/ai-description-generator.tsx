'use client';

import { useState } from 'react';
import { Wand2, RotateCcw, CheckCheck, Loader2 } from 'lucide-react';
import { generatePropertyDescription } from '@/lib/actions/ai';

interface PropertyData {
  type: string;
  transaction_type: 'sale' | 'rent';
  surface?: number;
  rooms?: number;
  bathrooms?: number;
  wilaya?: string;
  commune?: string;
  features?: string[];
  price?: number;
}

interface AiDescriptionGeneratorProps {
  onGenerate: (title: string, description: string) => void;
  propertyData: PropertyData;
}

type State = 'idle' | 'loading' | 'result' | 'error';

export function AiDescriptionGenerator({
  onGenerate,
  propertyData,
}: AiDescriptionGeneratorProps) {
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');

  const handleGenerate = async () => {
    setState('loading');
    setError(null);

    try {
      const result = await generatePropertyDescription(propertyData);

      if (result.error) {
        setError(result.error);
        setState('error');
        return;
      }

      setGeneratedTitle(result.title ?? '');
      setGeneratedDescription(result.description ?? '');
      setState('result');
    } catch {
      setError('Une erreur inattendue est survenue. Veuillez réessayer.');
      setState('error');
    }
  };

  const handleUse = () => {
    onGenerate(generatedTitle, generatedDescription);
    setState('idle');
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  // Idle state — just the trigger button
  if (state === 'idle') {
    return (
      <button
        type="button"
        onClick={handleGenerate}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-violet-300 bg-violet-50 text-violet-700 text-body-sm font-medium hover:bg-violet-100 hover:border-violet-400 transition-colors"
      >
        <Wand2 className="h-4 w-4" />
        Générer avec l&apos;IA
      </button>
    );
  }

  // Loading state
  if (state === 'loading') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-body-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
        Génération en cours…
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    const isPlanError = error?.includes('Pro') || error?.includes('Enterprise');

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
        <p className="text-body-sm text-red-700">
          {isPlanError ? (
            <>
              <span className="font-semibold">Fonctionnalité réservée aux plans Pro et Enterprise.</span>{' '}
              <a href="/pricing" className="underline hover:no-underline">
                Mettre à niveau
              </a>
            </>
          ) : (
            error
          )}
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium"
        >
          Retour
        </button>
      </div>
    );
  }

  // Result state
  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-violet-600" />
        <span className="text-body-sm font-semibold text-violet-700">Suggestions IA</span>
        <span className="text-caption text-neutral-500 ml-auto">Modifiables</span>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <label className="text-caption font-medium text-neutral-600 uppercase tracking-wide">
          Titre suggéré
        </label>
        <textarea
          value={generatedTitle}
          onChange={(e) => setGeneratedTitle(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-violet-200 bg-white text-body-sm text-neutral-900 placeholder:text-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
          placeholder="Titre généré par l'IA…"
          maxLength={120}
        />
        <p className="text-caption text-neutral-400 text-right">{generatedTitle.length}/120</p>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-caption font-medium text-neutral-600 uppercase tracking-wide">
          Description suggérée
        </label>
        <textarea
          value={generatedDescription}
          onChange={(e) => setGeneratedDescription(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 rounded-lg border border-violet-200 bg-white text-body-sm text-neutral-900 placeholder:text-neutral-400 resize-y focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
          placeholder="Description générée par l'IA…"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleUse}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-body-sm font-medium rounded-lg transition-colors"
        >
          <CheckCheck className="h-4 w-4" />
          Utiliser ces suggestions
        </button>
        <button
          type="button"
          onClick={handleRegenerate}
          className="flex items-center gap-2 px-4 py-2 border border-violet-300 bg-white text-violet-700 text-body-sm font-medium rounded-lg hover:bg-violet-50 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Régénérer
        </button>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="text-caption text-neutral-400 hover:text-neutral-600 ml-auto"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
