import { NextResponse } from "next/server"
import QRCode from "qrcode"
import { buildPixPayload } from "@/lib/pix"

export async function GET(request: Request) {
  const amountCents = Number(new URL(request.url).searchParams.get("amountCents") || "0")
  const key = process.env.PIX_KEY?.trim()

  if (!key) {
    return NextResponse.json(
      { error: "Configure PIX_KEY no arquivo apps/web/.env.local para gerar o QR Code." },
      { status: 503 },
    )
  }

  if (!amountCents) {
    return NextResponse.json({ error: "Valor inválido." }, { status: 400 })
  }

  const payload = buildPixPayload({
    key,
    merchantName: process.env.PIX_MERCHANT_NAME || "SUSTENTA HABILIDADE",
    merchantCity: process.env.PIX_MERCHANT_CITY || "SAO JOSE RP",
    amountCents,
  })

  const qrDataUrl = await QRCode.toDataURL(payload, {
    margin: 1,
    width: 280,
    color: { dark: "#123326", light: "#ffffff" },
  })

  return NextResponse.json({ payload, qrDataUrl, key })
}
