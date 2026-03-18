import * as React from "react";

interface WelcomeEmailProps {
  firstName: string;
}

export function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "32px" }}>
      <h1 style={{ color: "#0D9488", fontSize: "24px", marginBottom: "16px" }}>
        Bienvenue sur AqarVision, {firstName} !
      </h1>
      <p style={{ color: "#44403C", fontSize: "16px", lineHeight: "1.6" }}>
        Votre compte a été créé avec succès. Vous pouvez maintenant :
      </p>
      <ul style={{ color: "#44403C", fontSize: "16px", lineHeight: "2" }}>
        <li>Rechercher des biens immobiliers</li>
        <li>Sauvegarder vos favoris</li>
        <li>Déposer une annonce</li>
        <li>Contacter des agences</li>
      </ul>
      <p style={{ color: "#78716C", fontSize: "14px", marginTop: "32px" }}>
        L&apos;équipe AqarVision
      </p>
    </div>
  );
}
