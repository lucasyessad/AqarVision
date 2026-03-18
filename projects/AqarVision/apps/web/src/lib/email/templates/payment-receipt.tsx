import * as React from "react";

interface PaymentReceiptEmailProps {
  planName: string;
  amount: string;
  date: string;
  nextBillingDate?: string;
}

export function PaymentReceiptEmail({
  planName,
  amount,
  date,
  nextBillingDate,
}: PaymentReceiptEmailProps) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "32px" }}>
      <h1 style={{ color: "#0D9488", fontSize: "24px", marginBottom: "16px" }}>
        Reçu de paiement
      </h1>
      <div
        style={{
          padding: "20px",
          backgroundColor: "#F5F5F4",
          borderRadius: "8px",
        }}
      >
        <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#44403C" }}>
          <strong>Plan :</strong> {planName}
        </p>
        <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#44403C" }}>
          <strong>Montant :</strong> {amount}
        </p>
        <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#44403C" }}>
          <strong>Date :</strong> {date}
        </p>
        {nextBillingDate && (
          <p style={{ margin: 0, fontSize: "14px", color: "#44403C" }}>
            <strong>Prochain prélèvement :</strong> {nextBillingDate}
          </p>
        )}
      </div>
      <p style={{ color: "#78716C", fontSize: "14px", marginTop: "32px" }}>
        L&apos;équipe AqarVision
      </p>
    </div>
  );
}
