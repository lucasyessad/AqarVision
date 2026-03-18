import * as React from "react";

interface VisitConfirmedEmailProps {
  listingTitle: string;
  date: string;
  timeSlot: string;
  agencyName: string;
  agencyPhone: string;
  address: string;
}

export function VisitConfirmedEmail({
  listingTitle,
  date,
  timeSlot,
  agencyName,
  agencyPhone,
  address,
}: VisitConfirmedEmailProps) {
  const timeSlotLabels: Record<string, string> = {
    morning: "Matin (9h-12h)",
    afternoon: "Après-midi (14h-17h)",
    evening: "Soir (17h-19h)",
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "32px" }}>
      <h1 style={{ color: "#0D9488", fontSize: "24px", marginBottom: "16px" }}>
        Visite confirmée
      </h1>
      <p style={{ color: "#44403C", fontSize: "16px", lineHeight: "1.6" }}>
        Votre demande de visite pour <strong>&quot;{listingTitle}&quot;</strong>{" "}
        a été confirmée.
      </p>
      <div
        style={{
          marginTop: "24px",
          padding: "20px",
          backgroundColor: "#F0FDFA",
          borderRadius: "8px",
        }}
      >
        <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#44403C" }}>
          <strong>Date :</strong> {date}
        </p>
        <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#44403C" }}>
          <strong>Créneau :</strong> {timeSlotLabels[timeSlot] ?? timeSlot}
        </p>
        <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#44403C" }}>
          <strong>Adresse :</strong> {address}
        </p>
        <p style={{ margin: 0, fontSize: "14px", color: "#44403C" }}>
          <strong>Agence :</strong> {agencyName} — {agencyPhone}
        </p>
      </div>
      <p style={{ color: "#78716C", fontSize: "14px", marginTop: "32px" }}>
        L&apos;équipe AqarVision
      </p>
    </div>
  );
}
