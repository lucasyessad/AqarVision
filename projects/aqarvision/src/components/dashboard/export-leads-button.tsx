'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { getLeadsForExport, type LeadExportRow } from '@/lib/actions/export';

const SOURCE_LABELS: Record<string, string> = {
  contact_form: 'Formulaire contact',
  property_detail: 'Fiche bien',
  whatsapp: 'WhatsApp',
  phone: 'Téléphone',
  walk_in: 'Visite',
  referral: 'Recommandation',
  aqarsearch: 'AqarSearch',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  qualified: 'Qualifié',
  negotiation: 'En négociation',
  converted: 'Converti',
  lost: 'Perdu',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Faible',
  normal: 'Normal',
  high: 'Élevé',
  urgent: 'Urgent',
};

function generateCSV(leads: LeadExportRow[]): string {
  const headers = ['Nom', 'Téléphone', 'Email', 'Message', 'Statut', 'Priorité', 'Source', 'Bien', 'Date'];
  const rows = leads.map((l) => [
    l.name,
    l.phone,
    l.email ?? '',
    l.message ?? '',
    STATUS_LABELS[l.status] ?? l.status,
    PRIORITY_LABELS[l.priority] ?? l.priority,
    SOURCE_LABELS[l.source] ?? l.source,
    l.property_title ?? '',
    new Date(l.created_at).toLocaleDateString('fr-FR'),
  ]);

  return [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');
}

function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface ExportLeadsButtonProps {
  agencyId: string;
  plan: string;
}

const PRO_PLANS = ['pro', 'enterprise'];

export function ExportLeadsButton({ agencyId, plan }: ExportLeadsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only visible for pro/enterprise plans
  if (!PRO_PLANS.includes(plan)) return null;

  async function handleExport() {
    setLoading(true);
    setError(null);

    const result = await getLeadsForExport(agencyId);

    if (result.error || !result.data) {
      setError(result.error ?? 'Erreur lors de l\'export');
      setLoading(false);
      return;
    }

    if (result.data.length === 0) {
      setError('Aucun lead à exporter');
      setLoading(false);
      return;
    }

    const csv = generateCSV(result.data);
    const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCSV(csv, filename);
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleExport}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700
          transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {loading ? 'Export en cours...' : 'Exporter CSV'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
