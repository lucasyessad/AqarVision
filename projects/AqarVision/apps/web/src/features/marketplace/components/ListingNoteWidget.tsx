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
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#2d3748]">
          Votre note privée
        </h3>
        {isSaving && (
          <span className="text-xs text-[#a0aec0]">Sauvegarde...</span>
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
          className="w-full resize-none rounded-lg border border-gray-200 bg-[#f7fafc] px-3 py-2 text-sm text-[#2d3748] outline-none transition-colors focus:border-[#1a365d] focus:bg-white focus:ring-1 focus:ring-[#1a365d] placeholder:text-[#a0aec0]"
        />
      </form>

      <p className="mt-1 text-right text-xs text-[#a0aec0]">
        {content.length}/2000
      </p>
    </div>
  );
}
