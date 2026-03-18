"use client";

import { useTransition } from "react";
import { ContactCard } from "@/components/marketplace/ContactCard";
import { createAnonymousLeadAction } from "@/features/leads/actions/lead.action";
import { createVisitRequestAction } from "@/features/visit-requests/actions/visit-request.action";

interface Props {
  agencyName: string;
  agencySlug: string;
  verificationLevel: 1 | 2 | 3 | 4;
  phone: string;
  whatsappPhone?: string;
  listingTitle: string;
  listingId: string;
  buttonOrder?: string[];
}

export function AnnonceContactSection({
  agencyName,
  agencySlug,
  verificationLevel,
  phone,
  whatsappPhone,
  listingTitle,
  listingId,
  buttonOrder,
}: Props) {
  const [, startTransition] = useTransition();

  function handleSendMessage(data: { name: string; phone: string; message: string }) {
    startTransition(async () => {
      await createAnonymousLeadAction({
        listing_id: listingId,
        agency_id: agencySlug, // Will be resolved server-side
        name: data.name,
        phone: data.phone,
        message: data.message,
        lead_type: "info",
      });
    });
  }

  function handleRequestVisit(data: {
    name: string;
    phone: string;
    date: string;
    timeSlot: string;
  }) {
    startTransition(async () => {
      await createVisitRequestAction({
        listing_id: listingId,
        agency_id: agencySlug, // Will be resolved server-side
        name: data.name,
        phone: data.phone,
        preferred_date: data.date,
        preferred_time_slot: data.timeSlot as "morning" | "afternoon" | "evening",
      });
    });
  }

  return (
    <ContactCard
      agencyName={agencyName}
      agencySlug={agencySlug}
      verificationLevel={verificationLevel}
      phone={phone}
      whatsappPhone={whatsappPhone}
      listingTitle={listingTitle}
      buttonOrder={buttonOrder}
      onSendMessage={handleSendMessage}
      onRequestVisit={handleRequestVisit}
    />
  );
}
