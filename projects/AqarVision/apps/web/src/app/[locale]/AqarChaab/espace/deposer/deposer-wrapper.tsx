"use client";

import { WizardListing, type WizardState } from "@/features/listings/components/WizardListing";
import { saveDraftIndividualAction, publishIndividualListingAction } from "./deposer-actions";

interface DeposerChaabWrapperProps {
  userId: string;
  listingId?: string;
}

export function DeposerChaabWrapper({ userId, listingId }: DeposerChaabWrapperProps) {
  async function handleSaveDraft(
    id: string | null,
    data: Partial<WizardState>
  ): Promise<{ listingId: string }> {
    const result = await saveDraftIndividualAction(id, data as Record<string, unknown>, userId);
    if (!result.success) {
      throw new Error(result.message);
    }
    return result.data;
  }

  async function handlePublish(data: WizardState): Promise<void> {
    const result = await publishIndividualListingAction(data as unknown as Record<string, unknown>, userId);
    if (!result.success) {
      throw new Error(result.message);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <WizardListing
        mode={{ type: "individual", userId }}
        listingId={listingId}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        maxPhotos={3}
      />
    </div>
  );
}
