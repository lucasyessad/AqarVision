"use client";

import { WizardListing } from "@/features/listings/components/WizardListing";

/**
 * Wizard for anonymous users on /deposer.
 * No onPublish callback — WizardListing will save to localStorage
 * and redirect to login when the user clicks "Publier".
 * After login, /deposer redirects to /AqarChaab/espace/deposer
 * which restores the draft from localStorage.
 */
export function AnonymousWizardWrapper() {
  return (
    <WizardListing
      mode={{ type: "individual", userId: "" }}
      maxPhotos={3}
    />
  );
}
