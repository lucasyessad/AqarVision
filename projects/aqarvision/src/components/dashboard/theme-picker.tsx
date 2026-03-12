'use client';

import { Lock } from 'lucide-react';
import {
  THEME_REGISTRY,
  ALL_THEME_IDS,
  isThemeAvailable,
  type ThemeId,
  type ThemeManifest,
} from '@/lib/themes/registry';
import type { AgencyPlan, AgencyTheme } from '@/types/database';

interface ThemePickerProps {
  selectedTheme: AgencyTheme;
  agencyPlan: AgencyPlan;
  onSelect: (themeId: AgencyTheme) => void;
}

const PLAN_LABELS: Record<AgencyPlan, string> = {
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

function ThemeMiniPreview({ manifest }: { manifest: ThemeManifest }) {
  const { defaultColors } = manifest.style;
  const isDark = manifest.style.themeMode === 'dark';
  const bg = isDark ? '#0f0f1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';

  return (
    <div className="w-full aspect-[4/3] overflow-hidden rounded-t-lg" style={{ backgroundColor: bg }}>
      {/* Mini header */}
      <div
        className="h-[18%] flex items-center px-2.5 gap-1.5"
        style={{ backgroundColor: defaultColors.primary }}
      >
        <div className="w-3.5 h-3.5 rounded-sm bg-white/20" />
        <div className="h-1.5 w-8 rounded bg-white/40" />
        <div className="ml-auto flex gap-1">
          <div className="h-1 w-4 rounded bg-white/25" />
          <div className="h-1 w-4 rounded bg-white/25" />
        </div>
      </div>

      {/* Mini hero - varies by theme */}
      <div className="h-[35%] relative" style={{ backgroundColor: isDark ? defaultColors.primary : '#f3f4f6' }}>
        {manifest.id === 'minimal' && (
          <div className="flex items-center h-full px-3">
            <div className="space-y-1">
              <div className="h-2 w-16 rounded" style={{ backgroundColor: textColor, opacity: 0.7 }} />
              <div className="h-1 w-10 rounded" style={{ backgroundColor: textColor, opacity: 0.3 }} />
              <div className="mt-1.5 h-3 w-8 rounded-sm" style={{ backgroundColor: defaultColors.accent }} />
            </div>
          </div>
        )}
        {manifest.id === 'modern' && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-1">
              <div className="mx-auto h-2 w-14 rounded" style={{ backgroundColor: textColor, opacity: 0.6 }} />
              <div className="mx-auto h-1 w-10 rounded" style={{ backgroundColor: textColor, opacity: 0.3 }} />
              <div className="mx-auto mt-1 h-3 w-10 rounded-full" style={{ backgroundColor: defaultColors.accent }} />
            </div>
          </div>
        )}
        {manifest.id === 'professional' && (
          <div className="flex h-full px-3">
            <div className="flex-1 flex items-center">
              <div className="space-y-1">
                <div className="h-2.5 w-14 rounded" style={{ backgroundColor: textColor, opacity: 0.7 }} />
                <div className="h-1 w-10 rounded" style={{ backgroundColor: textColor, opacity: 0.3 }} />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-end gap-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-5 h-7 rounded-sm" style={{ backgroundColor: `${defaultColors.accent}20` }}>
                  <div className="mt-1 mx-auto h-1.5 w-2 rounded" style={{ backgroundColor: defaultColors.accent }} />
                </div>
              ))}
            </div>
          </div>
        )}
        {manifest.id === 'editorial' && (
          <div className="h-full relative">
            <div className="absolute inset-0" style={{ backgroundColor: defaultColors.primary, opacity: 0.15 }} />
            <div className="absolute bottom-2 left-3 space-y-0.5">
              <div className="h-2 w-12 rounded" style={{ backgroundColor: textColor, opacity: 0.8 }} />
              <div className="h-1 w-8 rounded" style={{ backgroundColor: textColor, opacity: 0.3 }} />
            </div>
          </div>
        )}
        {manifest.id === 'premium' && (
          <div className="h-full relative">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="space-y-1 text-center">
                <div className="mx-auto h-2 w-14 rounded bg-white/80" />
                <div className="mx-auto h-1 w-8 rounded bg-white/40" />
              </div>
            </div>
          </div>
        )}
        {manifest.id === 'luxury' && (
          <div className="h-full relative" style={{ backgroundColor: '#0a0a15' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="space-y-1 text-center">
                <div className="mx-auto h-2.5 w-16 rounded bg-white/70" />
                <div className="mx-auto h-0.5 w-6 rounded" style={{ backgroundColor: defaultColors.accent }} />
                <div className="mx-auto h-1 w-10 rounded bg-white/30" />
              </div>
            </div>
          </div>
        )}
        {manifest.id === 'bold' && (
          <div className="h-full relative overflow-hidden">
            <div
              className="absolute -right-4 -top-4 w-16 h-16 rotate-12"
              style={{ backgroundColor: defaultColors.accent, opacity: 0.3 }}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 space-y-1">
              <div className="h-2.5 w-12 rounded" style={{ backgroundColor: textColor, opacity: 0.8 }} />
              <div className="h-1 w-8 rounded" style={{ backgroundColor: textColor, opacity: 0.3 }} />
              <div className="h-3 w-9 rounded-md" style={{ backgroundColor: defaultColors.accent }} />
            </div>
          </div>
        )}
      </div>

      {/* Mini content area */}
      <div className="h-[30%] px-2.5 pt-2 flex gap-1.5" style={{ backgroundColor: bg }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 rounded-sm border overflow-hidden"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }}
          >
            <div className="h-[60%]" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }} />
            <div className="p-1">
              <div className="h-1 w-6 rounded" style={{ backgroundColor: textColor, opacity: 0.3 }} />
              <div className="mt-0.5 h-1 w-4 rounded" style={{ backgroundColor: defaultColors.accent, opacity: 0.6 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Mini footer */}
      <div
        className="h-[17%]"
        style={{ backgroundColor: defaultColors.primary }}
      />
    </div>
  );
}

function ThemeCard({
  manifest,
  isSelected,
  isLocked,
  requiredPlan,
  onSelect,
}: {
  manifest: ThemeManifest;
  isSelected: boolean;
  isLocked: boolean;
  requiredPlan?: AgencyPlan;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={isLocked ? undefined : onSelect}
      disabled={isLocked}
      className={`relative rounded-xl overflow-hidden border-2 text-left transition-all ${
        isSelected
          ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-md'
          : isLocked
            ? 'border-neutral-200 opacity-60 cursor-not-allowed'
            : 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm cursor-pointer'
      }`}
    >
      <ThemeMiniPreview manifest={manifest} />

      {/* Lock badge for unavailable themes */}
      {isLocked && requiredPlan && (
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-neutral-900/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          <Lock className="h-2.5 w-2.5" />
          {PLAN_LABELS[requiredPlan]}
        </div>
      )}

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Theme info */}
      <div className="px-3 py-2.5 bg-white border-t border-neutral-100">
        <p className="text-caption font-semibold text-neutral-900">{manifest.name.fr}</p>
        <p className="text-[11px] text-neutral-500 line-clamp-1">{manifest.description.fr}</p>
      </div>
    </button>
  );
}

export function ThemePicker({ selectedTheme, agencyPlan, onSelect }: ThemePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {ALL_THEME_IDS.map((themeId) => {
        const manifest = THEME_REGISTRY[themeId];
        const available = isThemeAvailable(themeId, agencyPlan);

        return (
          <ThemeCard
            key={themeId}
            manifest={manifest}
            isSelected={selectedTheme === themeId}
            isLocked={!available}
            requiredPlan={!available ? manifest.planMin : undefined}
            onSelect={() => onSelect(themeId)}
          />
        );
      })}

      {/* Custom option */}
      <button
        type="button"
        onClick={() => onSelect('custom')}
        className={`relative rounded-xl overflow-hidden border-2 text-left transition-all ${
          selectedTheme === 'custom'
            ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-md'
            : 'border-dashed border-neutral-300 hover:border-neutral-400 cursor-pointer'
        }`}
      >
        <div className="w-full aspect-[4/3] bg-gradient-to-br from-neutral-50 to-neutral-100 flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center shadow-sm">
            <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
          </div>
          <p className="text-caption text-neutral-500">Vos couleurs</p>
        </div>

        {selectedTheme === 'custom' && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        <div className="px-3 py-2.5 bg-white border-t border-neutral-100">
          <p className="text-caption font-semibold text-neutral-900">Personnalisé</p>
          <p className="text-[11px] text-neutral-500">Vos propres couleurs</p>
        </div>
      </button>
    </div>
  );
}
