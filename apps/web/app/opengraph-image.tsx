import { ImageResponse } from "next/og"
import { event, siteSeo } from "@/lib/event"

export const alt = siteSeo.description
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#123326",
          color: "#ffffff",
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#6eb4d4",
          }}
        >
          <span>
            {event.edition} EDIÇÃO · {event.year}
          </span>
          <span style={{ color: "#a0bf47" }}>INSCREVA-SE</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              lineHeight: 1.05,
              fontWeight: 700,
            }}
          >
            Sustenta <span style={{ color: "#6eb4d4", marginLeft: 18 }}>&</span>
            <span style={{ marginLeft: 18 }}>Habilidade</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 28,
              color: "#e7f4e2",
              maxWidth: 920,
              lineHeight: 1.35,
            }}
          >
            {event.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", fontSize: 24, color: "#e7f4e2" }}>
            <span style={{ fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {event.datesLabel}
            </span>
            <span style={{ marginTop: 8 }}>
              {event.location} · {event.campus}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              background: "#a0bf47",
              color: "#123326",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "16px 28px",
              borderRadius: 999,
            }}
          >
            Garantir vaga
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
