import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { getTrustLevel } from '@/lib/search/trust-score';

interface TrustBadgeProps {
  score: number;
  locale?: 'fr' | 'ar' | 'en';
}

const labels = {
  fr: { high: 'Confiance élevée', medium: 'Confiance moyenne', low: 'À vérifier' },
  ar: { high: 'ثقة عالية', medium: 'ثقة متوسطة', low: 'للتحقق' },
  en: { high: 'High trust', medium: 'Medium trust', low: 'To verify' },
} as const;

const styles = {
  high: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-red-100 text-red-800 border-red-200',
} as const;

const icons = {
  high: ShieldCheck,
  medium: Shield,
  low: ShieldAlert,
} as const;

export function TrustBadge({ score, locale = 'fr' }: TrustBadgeProps) {
  const level = getTrustLevel(score);
  const label = labels[locale][level];
  const Icon = icons[level];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${styles[level]}`}
      title={`Score: ${score}/100`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
