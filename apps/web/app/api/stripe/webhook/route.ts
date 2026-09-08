import { NextResponse } from "next/server"
import Stripe from "stripe"

const PAYLOAD_URL = process.env.PAYLOAD_URL || "http://localhost:3001"

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook não configurado." }, { status: 503 })
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente." }, { status: 400 })
  }

  const stripe = new Stripe(secret)
  const payload = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.id) {
      await fetch(`${PAYLOAD_URL}/api/confirmar-pagamento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": process.env.INTERNAL_SECRET || "",
        },
        body: JSON.stringify({ stripeSessionId: session.id }),
      })
    }
  }

  return NextResponse.json({ received: true })
}
