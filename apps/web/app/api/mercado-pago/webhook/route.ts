import { NextResponse } from "next/server"

const PAYLOAD_URL = process.env.PAYLOAD_URL || "http://localhost:3001"

async function handleNotification(request: Request) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json({ error: "Mercado Pago não configurado." }, { status: 503 })
  }

  const url = new URL(request.url)
  let paymentId = url.searchParams.get("data.id") || url.searchParams.get("id") || ""

  try {
    const body = (await request.json()) as { data?: { id?: string | number }; id?: string | number }
    paymentId = String(body?.data?.id || body?.id || paymentId || "")
  } catch {
    // IPN can arrive without a JSON body.
  }

  if (!paymentId) {
    return NextResponse.json({ received: true })
  }

  const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const payment = (await paymentResponse.json()) as { status?: string }

  if (payment.status === "approved") {
    await fetch(`${PAYLOAD_URL}/api/confirmar-pagamento`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": process.env.INTERNAL_SECRET || "",
      },
      body: JSON.stringify({ mercadoPagoPaymentId: String(paymentId) }),
    })
  }

  return NextResponse.json({ received: true })
}

export async function GET(request: Request) {
  return handleNotification(request)
}

export async function POST(request: Request) {
  return handleNotification(request)
}
