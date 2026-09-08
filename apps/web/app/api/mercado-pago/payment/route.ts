import { NextResponse } from "next/server"
import { ticketTypes } from "@/lib/event"
import { cardTotalCents, centsToAmount } from "@/lib/money"

const PAYLOAD_URL = process.env.PAYLOAD_URL || "http://localhost:3001"

type CardFormData = {
  token?: string
  issuer_id?: string | number
  payment_method_id?: string
  transaction_amount?: number
  installments?: number
  payment_method_option_id?: string
  processing_mode?: string
  payer?: {
    email?: string
    identification?: { type?: string; number?: string }
  }
}

type Body = {
  nomeCompleto?: string
  email?: string
  cpf?: string
  telefone?: string
  instituicao?: string
  ra?: string
  isUnesp?: boolean
  categoria?: string
  cardFormData?: CardFormData
}

const rejectionMessages: Record<string, string> = {
  cc_rejected_insufficient_amount: "Cartão sem saldo suficiente.",
  cc_rejected_bad_filled_security_code: "Código de segurança inválido.",
  cc_rejected_bad_filled_date: "Data de validade inválida.",
  cc_rejected_bad_filled_other: "Revise os dados do cartão.",
  cc_rejected_call_for_authorize: "O banco precisa autorizar este pagamento.",
  cc_rejected_card_disabled: "Cartão desabilitado. Fale com o banco.",
  cc_rejected_high_risk: "Pagamento recusado por segurança.",
  cc_rejected_other_reason: "O banco recusou o pagamento.",
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "")
}

function isSandbox() {
  const key = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || process.env.MERCADO_PAGO_PUBLIC_KEY || ""
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN || ""
  return key.startsWith("TEST-") || token.startsWith("TEST-")
}

function rejectionError(statusDetail?: string) {
  const base = rejectionMessages[statusDetail || ""] || "Pagamento recusado."
  if (isSandbox()) {
    return `${base} No sandbox do Mercado Pago, o nome do titular precisa ser APRO (e o CPF 123.456.789-09) para aprovar.`
  }
  return base
}

async function confirmPayment(mercadoPagoPaymentId: string) {
  await fetch(`${PAYLOAD_URL}/api/confirmar-pagamento`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": process.env.INTERNAL_SECRET || "",
    },
    body: JSON.stringify({ mercadoPagoPaymentId }),
  })
}

export async function POST(request: Request) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json(
      { error: "Configure MERCADO_PAGO_ACCESS_TOKEN para habilitar o pagamento com cartão." },
      { status: 503 },
    )
  }

  const body = (await request.json()) as Body
  const ticket = ticketTypes.find((item) => item.id === body.categoria)
  const formData = body.cardFormData

  if (!body.nomeCompleto || !body.email || !body.cpf || !body.telefone || !ticket) {
    return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 })
  }

  if (!formData?.token || !formData.payment_method_id || !formData.installments) {
    return NextResponse.json({ error: "Dados do cartão incompletos." }, { status: 400 })
  }

  const amountCents = cardTotalCents(ticket.priceCents)
  const transactionAmount = centsToAmount(amountCents)
  const brickAmount = Number(formData.transaction_amount)

  if (Number.isFinite(brickAmount) && Math.abs(brickAmount - transactionAmount) > 0.009) {
    return NextResponse.json({ error: "Valor do pagamento não confere com o ingresso." }, { status: 400 })
  }

  const paymentPayload: Record<string, unknown> = {
    transaction_amount: transactionAmount,
    token: formData.token,
    description: `Inscrição II Sustenta & Habilidade — ${ticket.title}`,
    installments: Number(formData.installments),
    payment_method_id: formData.payment_method_id,
    payer: {
      email: formData.payer?.email || body.email,
      identification: {
        type: formData.payer?.identification?.type || "CPF",
        number: onlyDigits(formData.payer?.identification?.number || body.cpf),
      },
    },
    metadata: {
      cpf: onlyDigits(body.cpf),
      categoria: ticket.id,
    },
  }

  if (formData.issuer_id) {
    paymentPayload.issuer_id = String(formData.issuer_id)
  }
  if (formData.payment_method_option_id) {
    paymentPayload.payment_method_option_id = formData.payment_method_option_id
  }
  if (formData.processing_mode) {
    paymentPayload.processing_mode = formData.processing_mode
  }

  const paymentResponse = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(paymentPayload),
  })

  const payment = (await paymentResponse.json()) as {
    id?: number | string
    status?: string
    status_detail?: string
    message?: string
    cause?: { description?: string; code?: string }[]
  }

  if (!paymentResponse.ok) {
    const message =
      payment.cause?.[0]?.description || payment.message || "Não foi possível processar o pagamento."
    return NextResponse.json({ error: message, statusDetail: payment.status_detail }, { status: 400 })
  }

  if (payment.status === "rejected") {
    return NextResponse.json({
      status: payment.status,
      statusDetail: payment.status_detail,
      error: rejectionError(payment.status_detail),
    })
  }

  const payloadResponse = await fetch(`${PAYLOAD_URL}/api/submit-inscricao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nomeCompleto: body.nomeCompleto,
      email: body.email,
      cpf: onlyDigits(body.cpf),
      telefone: onlyDigits(body.telefone),
      instituicao: body.instituicao || "",
      ra: body.ra || "",
      isUnesp: Boolean(body.isUnesp),
      categoria: ticket.id,
      valorCentavos: amountCents,
      metodoPagamento: "cartao",
      mercadoPagoPaymentId: String(payment.id),
    }),
  })

  if (!payloadResponse.ok) {
    const data = await payloadResponse.json()
    return NextResponse.json(
      {
        error:
          data?.errors?.[0]?.message ||
          data?.error ||
          "Pagamento feito, mas a inscrição não foi registrada. Fale com a organização.",
      },
      { status: payloadResponse.status },
    )
  }

  if (payment.status === "approved" && payment.id) {
    await confirmPayment(String(payment.id))
  }

  return NextResponse.json({
    status: payment.status,
    statusDetail: payment.status_detail,
    paymentId: payment.id,
  })
}
