"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveListingNote } from "@/features/marketplace/actions/listing-notes.action";

interface ListingNoteWidgetProps {
  listingId: string;
  initialContent?: string;
}

export function ListingNoteWidget({
  listingId,
  initialContent = "",
}: ListingNoteWidgetProps) {
  const [content, setContent] = useState(initialContent);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useActionState(saveListingNote, null);

  useEffect(() => {
    if (state?.success) {
      setSavedAt(new Date().toLocaleTimeString("fr-FR"));
      setIsSaving(false);
    } else if (state && !state.success) {
      setIsSaving(false);
    }
  }, [state]);

  function handleChange(value: string) {
    setContent(value);
    setIsSaving(true);
    setSavedAt(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 1000);
  }

  return (
    <div className="rounded-xl bg-white dark:bg-zinc-900 p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Votre note privée
        </h3>
        {isSaving && (
          <span className="text-xs text-zinc-400">Sauvegarde...</span>
        )}
        {!isSaving && savedAt && (
          <span className="text-xs text-emerald-500">Sauvegardé à {savedAt}</span>
        )}
        {state && !state.success && (
          <span className="text-xs text-red-500">{state.error.message}</span>
        )}
      </div>

      <form ref={formRef} action={formAction}>
        <input type="hidden" name="listing_id" value={listingId} />
        <textarea
          name="content"
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Ajoutez une note personnelle sur cette annonce..."
          rows={4}
          maxLength={2000}
          className="w-full resize-none rounded-lg border border-gray-200 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 outline-none transition-colors focus:border-zinc-900 focus:bg-white dark:bg-zinc-900 focus:ring-1 focus:ring-zinc-900 placeholder:text-zinc-400"
        />
      </form>

      <p className="mt-1 text-right text-xs text-zinc-400">
        {content.length}/2000
      </p>
    </div>
  );
}
