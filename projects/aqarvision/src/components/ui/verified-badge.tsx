import { ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function VerifiedBadge({ size = 'md', showLabel = true }: VerifiedBadgeProps) {
  const sizes = {
    sm: { icon: 'h-3 w-3', text: 'text-[10px]', padding: 'px-1.5 py-0.5' },
    md: { icon: 'h-4 w-4', text: 'text-xs', padding: 'px-2 py-1' },
    lg: { icon: 'h-5 w-5', text: 'text-sm', padding: 'px-3 py-1.5' },
  };
  const s = sizes[size];
  return (
    <span
      className={`inline-flex items-center gap-1 ${s.padding} bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 font-medium`}
      title="Agence vérifiée par AqarVision"
    >
      <ShieldCheck className={`${s.icon} text-emerald-600`} />
      {showLabel && <span className={s.text}>Vérifiée</span>}
    </span>
  );
}
