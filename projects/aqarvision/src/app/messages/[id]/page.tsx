import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getMessages, markMessagesAsRead } from '@/lib/actions/messaging';
import { MessageThread } from '@/components/messaging/message-thread';
import { MessageInput } from '@/components/messaging/message-input';

interface MessageDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MessageDetailPage({ params }: MessageDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirectTo=/messages/${id}`);

  // Fetch conversation details
  const { data: conversation } = await supabase
    .from('conversations')
    .select('*, agencies:agency_id(name, slug)')
    .eq('id', id)
    .single();

  if (!conversation) notFound();

  // Verify participant access (RLS will handle this, but extra safety check)
  const isParticipant =
    conversation.user_id === user.id ||
    (conversation.agencies as { name: string; slug: string } | null) !== null;

  if (!isParticipant) notFound();

  const { messages, error } = await getMessages(id);

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-body-sm text-red-600">{error}</p>
      </div>
    );
  }

  // Mark messages as read
  await markMessagesAsRead(id);

  const agency = conversation.agencies as { name: string; slug: string } | null;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/messages"
            className="flex-shrink-0 p-2 -ml-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            aria-label="Retour aux messages"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary-600" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-body-md font-semibold text-neutral-900 truncate">
              {agency?.name ?? 'Agence'}
            </p>
            {agency?.slug && (
              <Link
                href={`/agence/${agency.slug}`}
                className="text-caption text-primary-600 hover:underline truncate block"
              >
                Voir la vitrine
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Messages + Input */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
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
