import { redirect } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getConversations } from '@/lib/actions/messaging';
import { ConversationList } from '@/components/messaging/conversation-list';

export default async function DashboardMessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Verify user has an agency
  const { data: agency } = await supabase
    .from('agencies')
    .select('id, name')
    .eq('owner_id', user.id)
    .single();

  if (!agency) {
    return (
      <div className="p-8">
        <p className="text-body-sm text-red-600">Agence introuvable.</p>
      </div>
    );
  }

  const { conversations, error } = await getConversations();

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="mt-1 text-sm text-gray-500">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            {totalUnread > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                {totalUnread} non lu{totalUnread !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          <p className="text-gray-500">Aucun message pour le moment</p>
          <p className="mt-2 text-sm text-gray-400">
            Les messages de vos prospects apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <ConversationList
            conversations={conversations}
            basePath="/dashboard/messages"
          />
        </div>
      )}
    </div>
  );
}
