import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SnapID — Passport & ID Photos in Ottawa";

// Branded social share card.
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#10233C",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 999,
              border: "6px solid #3B82F6",
              color: "#fff",
              fontSize: 44,
              fontWeight: 800,
            }}
          >
            S
          </div>
          <div style={{ color: "#9EC0FF", fontSize: 30, fontWeight: 700 }}>
            SnapID
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -1,
              maxWidth: 960,
            }}
          >
            Passport &amp; ID photos accepted the first time.
          </div>
          <div style={{ color: "#C3D3E8", fontSize: 32, maxWidth: 900 }}>
            Every country, every document · Ottawa home studio &amp; mobile ·
            newborn specialists
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, color: "#9EC0FF", fontSize: 26 }}>
          Riverside South · Barrhaven · Compliance guaranteed
        </div>
      </div>
    ),
    { ...size },
  );
}
