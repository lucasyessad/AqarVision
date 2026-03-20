"use client";

import { useRouter } from "@/lib/i18n/navigation";
import { WizardListing, type WizardState } from "@/features/listings/components/WizardListing";
import { saveDraftIndividualAction, publishIndividualListingAction } from "./deposer-actions";

interface DeposerChaabWrapperProps {
  userId: string;
  listingId?: string;
}

export function DeposerChaabWrapper({ userId, listingId }: DeposerChaabWrapperProps) {
  const router = useRouter();

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
    // Map WizardState (camelCase) → CreateListingInput (snake_case)
    const payload = {
      listing_type: data.listingType,
      property_type: data.propertyType,
      wilaya_code: data.wilayaCode,
      commune_id: data.communeId,
      address: data.address || undefined,
      latitude: data.latitude ?? undefined,
      longitude: data.longitude ?? undefined,
      details: data.details,
      price: data.price,
      currency: data.currency,
      translations: data.translations,
      contact_phone: data.contactPhone || undefined,
      show_phone: data.showPhone,
      accept_messages: data.acceptMessages,
    };

    const result = await publishIndividualListingAction(payload as Record<string, unknown>, userId);
    if (!result.success) {
      throw new Error(result.message);
    }
    // Success — clear draft and redirect
    localStorage.removeItem("aqar-wizard-draft");
    router.push("/AqarChaab/espace/mes-annonces");
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
