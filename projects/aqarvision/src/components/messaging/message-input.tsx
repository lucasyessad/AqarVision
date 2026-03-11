'use client';

import { useState, useRef, useTransition } from 'react';
import { Send } from 'lucide-react';
import { sendMessage } from '@/lib/actions/messaging';

interface MessageInputProps {
  conversationId: string;
  onSent?: () => void;
}

const MAX_CHARS = 2000;

export function MessageInput({ conversationId, onSent }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charsLeft = MAX_CHARS - content.length;
  const canSend = content.trim().length > 0 && content.length <= MAX_CHARS && !isPending;

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleSubmit() {
    if (!canSend) return;

    setError(null);
    const trimmed = content.trim();

    startTransition(async () => {
      const result = await sendMessage(conversationId, trimmed);
      if (!result.success) {
        setError(result.error ?? 'Erreur lors de l\'envoi');
        return;
      }
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      onSent?.();
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <div className="border-t border-neutral-200 bg-white p-4">
      {error && (
        <p className="text-caption text-red-600 mb-2">{error}</p>
      )}
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message… (Entrée pour envoyer, Maj+Entrée pour sauter une ligne)"
            rows={1}
            maxLength={MAX_CHARS}
            disabled={isPending}
            className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-body-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors disabled:opacity-50"
            style={{ minHeight: '44px', maxHeight: '160px' }}
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 active:bg-primary-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Envoyer"
        >
          {isPending ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Character counter — only show when approaching limit */}
      {content.length > MAX_CHARS * 0.8 && (
        <p className={`text-caption mt-1.5 text-right ${charsLeft < 0 ? 'text-red-500' : 'text-neutral-400'}`}>
          {charsLeft} caractère{Math.abs(charsLeft) !== 1 ? 's' : ''} restant{Math.abs(charsLeft) !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
