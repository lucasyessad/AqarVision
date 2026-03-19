import * as React from "react";

interface ModerationResultEmailProps {
  listingTitle: string;
  status: "approved" | "rejected";
  reason?: string;
}

export function ModerationResultEmail({
  listingTitle,
  status,
  reason,
}: ModerationResultEmailProps) {
  const isApproved = status === "approved";

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "32px" }}>
      <h1
        style={{
          color: isApproved ? "#16A34A" : "#DC2626",
          fontSize: "24px",
          marginBottom: "16px",
        }}
      >
        {isApproved ? "Annonce publiée" : "Annonce refusée"}
      </h1>
      <p style={{ color: "#44403C", fontSize: "16px", lineHeight: "1.6" }}>
        Votre annonce <strong>&quot;{listingTitle}&quot;</strong> a été{" "}
        {isApproved ? "approuvée et publiée" : "refusée par notre équipe"}.
      </p>
      {reason && (
        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            backgroundColor: "#FEF2F2",
            borderRadius: "8px",
          }}
        >
          <p style={{ color: "#991B1B", fontSize: "14px", margin: 0 }}>
            <strong>Raison :</strong> {reason}
          </p>
        </div>
      )}
      <p style={{ color: "#78716C", fontSize: "14px", marginTop: "32px" }}>
        L&apos;équipe AqarVision
      </p>
    </div>
  );
}
