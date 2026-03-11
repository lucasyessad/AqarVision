import Link from 'next/link';
import { MessageSquare, Building2, Home } from 'lucide-react';
import { UnreadBadge } from './unread-badge';
import type { ConversationWithMeta } from '@/lib/actions/messaging';

interface ConversationListProps {
  conversations: ConversationWithMeta[];
  basePath?: string; // '/messages' for users, '/dashboard/messages' for agents
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function ConversationList({ conversations, basePath = '/messages' }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
          <MessageSquare className="w-7 h-7 text-neutral-400" />
        </div>
        <p className="text-body-md font-medium text-neutral-700">Aucune conversation</p>
        <p className="text-body-sm text-neutral-500 mt-1">
          Vos échanges avec les agences apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-100">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`${basePath}/${conversation.id}`}
          className="flex items-start gap-4 px-4 py-4 hover:bg-neutral-50 transition-colors"
        >
          {/* Avatar */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-600" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-body-md font-semibold text-neutral-900 truncate">
                {conversation.agency_name ?? 'Agence'}
              </span>
              <span className="flex-shrink-0 text-caption text-neutral-400">
                {formatRelativeTime(conversation.last_message_at)}
              </span>
            </div>

            {conversation.property_id && (
              <div className="flex items-center gap-1 mb-0.5">
                <Home className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                <span className="text-caption text-neutral-500 truncate">
                  {conversation.subject ?? 'Bien immobilier'}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <p className="text-body-sm text-neutral-500 truncate">
                {conversation.last_message_content ?? 'Aucun message'}
              </p>
              {conversation.unread_count > 0 && (
                <UnreadBadge count={conversation.unread_count} />
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
