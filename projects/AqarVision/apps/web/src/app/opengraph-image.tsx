import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AqarVision — Plateforme immobilière algérienne";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #1C1917 0%, #292524 50%, #0D9488 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 16,
            background: "#0D9488",
            marginBottom: 32,
          }}
        >
          <span
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: -2,
            }}
          >
            AV
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#FAFAF9",
            letterSpacing: -1,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          AqarVision
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: 24,
            color: "#A8A29E",
            marginTop: 16,
            letterSpacing: 0.5,
          }}
        >
          Plateforme immobiliere algerienne
        </p>

        {/* Accent bar */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 40,
          }}
        >
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#0D9488" }} />
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#FBBF24" }} />
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#0D9488" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
