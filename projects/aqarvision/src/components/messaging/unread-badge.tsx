import type { ConversationWithMeta } from '@/lib/actions/messaging';

interface UnreadBadgeProps {
  count: number;
}

export function UnreadBadge({ count }: UnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-semibold leading-none">
      {count > 99 ? '99+' : count}
    </span>
  );
}

// Re-export for convenience
export type { ConversationWithMeta };
