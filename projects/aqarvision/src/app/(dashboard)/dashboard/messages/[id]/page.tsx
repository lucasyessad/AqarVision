import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getMessages, markMessagesAsRead } from '@/lib/actions/messaging';
import { MessageThread } from '@/components/messaging/message-thread';
import { MessageInput } from '@/components/messaging/message-input';

interface DashboardMessageDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardMessageDetailPage({ params }: DashboardMessageDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Verify user has an agency
  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!agency) redirect('/dashboard');

  // Fetch conversation — RLS ensures only participants can read
  const { data: conversation } = await supabase
    .from('conversations')
    .select('*, properties:property_id(title)')
    .eq('id', id)
    .single();

  if (!conversation) notFound();

  const { messages, error } = await getMessages(id);

  if (error) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  // Mark messages as read
  await markMessagesAsRead(id);

  const property = conversation.properties as { title: string } | null;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Sub-header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center gap-3 flex-shrink-0">
        <Link
          href="/dashboard/messages"
          className="flex-shrink-0 p-1.5 -ml-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Retour aux messages"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <User className="w-4 h-4 text-gray-500" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            Prospect
          </p>
          {property?.title && (
            <p className="text-xs text-gray-500 truncate">
              {property.title}
            </p>
          )}
        </div>
      </div>

      {/* Messages + Input */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <MessageThread
          conversationId={id}
          initialMessages={messages}
          currentUserId={user.id}
        />
        <MessageInput conversationId={id} />
      </div>
    </div>
  );
}
