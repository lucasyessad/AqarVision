import * as React from "react";

interface AlertMatchListing {
  title: string;
  price: string;
  location: string;
  url: string;
}

interface AlertMatchEmailProps {
  alertName: string;
  listings: AlertMatchListing[];
  searchUrl: string;
}

export function AlertMatchEmail({
  alertName,
  listings,
  searchUrl,
}: AlertMatchEmailProps) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "32px" }}>
      <h1 style={{ color: "#0D9488", fontSize: "24px", marginBottom: "16px" }}>
        Nouvelles annonces pour &quot;{alertName}&quot;
      </h1>
      <p style={{ color: "#44403C", fontSize: "16px", lineHeight: "1.6" }}>
        {listings.length} nouvelle{listings.length > 1 ? "s" : ""} annonce
        {listings.length > 1 ? "s" : ""} correspondant à votre alerte :
      </p>
      <div style={{ marginTop: "24px" }}>
        {listings.map((listing, i) => (
          <a
            key={i}
            href={listing.url}
            style={{
              display: "block",
              padding: "16px",
              marginBottom: "8px",
              backgroundColor: "#F5F5F4",
              borderRadius: "8px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <p
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#0C0A09",
                margin: "0 0 4px",
              }}
            >
              {listing.title}
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#78716C",
                margin: "0 0 4px",
              }}
            >
              {listing.location}
            </p>
            <p
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#0D9488",
                margin: 0,
              }}
            >
              {listing.price}
            </p>
          </a>
        ))}
      </div>
      <a
        href={searchUrl}
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
        Voir toutes les annonces
      </a>
    </div>
  );
}
