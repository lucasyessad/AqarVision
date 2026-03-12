'use client';

import { useState, useTransition } from 'react';
import { Settings, RotateCcw } from 'lucide-react';
import { saveDashboardPreferences, resetDashboardPreferences } from '@/lib/actions/dashboard-preferences';

const WIDGET_LABELS: Record<string, string> = {
  stats: 'Statistiques',
  recent_leads: 'Derniers leads',
  activity: 'Activité récente',
  visit_requests: 'Demandes de visite',
};

const DEFAULT_ORDER = ['stats', 'recent_leads', 'activity', 'visit_requests'];

interface DashboardCustomizerProps {
  currentOrder: string[];
  hiddenWidgets: string[];
}

export function DashboardCustomizer({ currentOrder, hiddenWidgets }: DashboardCustomizerProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState<string[]>(hiddenWidgets);

  function toggleWidget(widgetId: string) {
    const newHidden = hidden.includes(widgetId)
      ? hidden.filter((w) => w !== widgetId)
      : [...hidden, widgetId];
    setHidden(newHidden);

    startTransition(async () => {
      await saveDashboardPreferences({
        widget_order: currentOrder,
        hidden_widgets: newHidden,
      });
    });
  }

  function handleReset() {
    setHidden([]);
    startTransition(async () => {
      await resetDashboardPreferences();
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 h-9 px-3 text-body-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
      >
        <Settings className="h-4 w-4" />
        Personnaliser
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-30 w-64 bg-white rounded-xl border border-neutral-200 shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-body-sm font-semibold text-neutral-900">Widgets</p>
            <button
              onClick={handleReset}
              disabled={isPending}
              className="flex items-center gap-1 text-caption text-neutral-500 hover:text-neutral-700"
            >
              <RotateCcw className="h-3 w-3" />
              Réinitialiser
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {DEFAULT_ORDER.map((widgetId) => (
              <label
                key={widgetId}
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  isPending ? 'opacity-50' : 'hover:bg-neutral-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!hidden.includes(widgetId)}
                  onChange={() => toggleWidget(widgetId)}
                  disabled={isPending}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-body-sm text-neutral-700">{WIDGET_LABELS[widgetId]}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
