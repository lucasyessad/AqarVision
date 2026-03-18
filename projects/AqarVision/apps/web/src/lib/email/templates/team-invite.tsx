import * as React from "react";

interface TeamInviteEmailProps {
  agencyName: string;
  role: string;
  inviteUrl: string;
}

export function TeamInviteEmail({
  agencyName,
  role,
  inviteUrl,
}: TeamInviteEmailProps) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "32px" }}>
      <h1 style={{ color: "#0D9488", fontSize: "24px", marginBottom: "16px" }}>
        Invitation à rejoindre {agencyName}
      </h1>
      <p style={{ color: "#44403C", fontSize: "16px", lineHeight: "1.6" }}>
        Vous avez été invité à rejoindre l&apos;agence <strong>{agencyName}</strong> en
        tant que <strong>{role}</strong> sur AqarVision.
      </p>
      <a
        href={inviteUrl}
        style={{
          display: "inline-block",
          marginTop: "24px",
          padding: "12px 32px",
          backgroundColor: "#0D9488",
          color: "#FFFFFF",
          textDecoration: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        Accepter l&apos;invitation
      </a>
      <p style={{ color: "#78716C", fontSize: "14px", marginTop: "32px" }}>
        Ce lien expire dans 7 jours.
      </p>
    </div>
  );
}
