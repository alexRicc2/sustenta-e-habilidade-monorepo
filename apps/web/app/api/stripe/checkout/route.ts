import { NextResponse } from "next/server"
import Stripe from "stripe"
import { ticketTypes } from "@/lib/event"

const PAYLOAD_URL = process.env.PAYLOAD_URL || "http://localhost:3001"

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    return NextResponse.json(
      { error: "Configure STRIPE_SECRET_KEY para habilitar o pagamento com cartão." },
      { status: 503 },
    )
  }

  const body = (await request.json()) as {
    nomeCompleto?: string
    email?: string
    cpf?: string
    telefone?: string
    instituicao?: string
    ra?: string
    isUnesp?: boolean
    categoria?: string
  }

  const ticket = ticketTypes.find((item) => item.id === body.categoria)
  if (!body.nomeCompleto || !body.email || !body.cpf || !body.telefone || !ticket) {
    return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 })
  }

  const stripe = new Stripe(secret)
  const origin = request.headers.get("origin") || "http://localhost:3000"

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    ui_mode: "embedded",
    redirect_on_completion: "never",
    customer_email: body.email,
    locale: "pt-BR",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "brl",
          unit_amount: ticket.priceCents,
          product_data: {
            name: `Inscrição II Sustenta & Habilidade — ${ticket.title}`,
          },
        },
      },
    ],
    metadata: {
      cpf: body.cpf,
      categoria: ticket.id,
    },
  })

  const payloadResponse = await fetch(`${PAYLOAD_URL}/api/submit-inscricao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nomeCompleto: body.nomeCompleto,
      email: body.email,
      cpf: body.cpf,
      telefone: body.telefone,
      instituicao: body.instituicao || "",
      ra: body.ra || "",
      isUnesp: Boolean(body.isUnesp),
      categoria: ticket.id,
      valorCentavos: ticket.priceCents,
      metodoPagamento: "cartao",
      stripeSessionId: session.id,
    }),
  })

  if (!payloadResponse.ok) {
    const data = await payloadResponse.json()
    return NextResponse.json(
      { error: data?.errors?.[0]?.message || data?.error || "Não foi possível registrar a inscrição." },
      { status: payloadResponse.status },
    )
  }

  if (!session.client_secret) {
    return NextResponse.json({ error: "Stripe não retornou client_secret." }, { status: 500 })
  }

  return NextResponse.json({
    clientSecret: session.client_secret,
    sessionId: session.id,
    returnUrl: `${origin}/inscricoes`,
  })
}
