import { NextResponse } from "next/server"
import { ticketRequiresProof, ticketTypes } from "@/lib/event"
import { uploadPayloadMedia } from "@/lib/payload-media"

const PAYLOAD_URL = process.env.PAYLOAD_URL || "http://localhost:3001"

export async function POST(request: Request) {
  const formData = await request.formData()
  const categoria = String(formData.get("categoria") || "")
  const ticket = ticketTypes.find((item) => item.id === categoria)
  const nomeCompleto = String(formData.get("nomeCompleto") || "")
  const comprovante = formData.get("comprovante")
  const comprovantePermanencia = formData.get("comprovantePermanencia")

  if (!ticket) {
    return NextResponse.json({ error: "Selecione um ingresso válido." }, { status: 400 })
  }

  if (ticketRequiresProof(ticket.id) && !(comprovantePermanencia instanceof File && comprovantePermanencia.size > 0)) {
    return NextResponse.json({ error: "Anexe o comprovante de permanência estudantil." }, { status: 400 })
  }

  try {
    let comprovanteId: string | undefined
    if (comprovante instanceof File && comprovante.size > 0) {
      comprovanteId = await uploadPayloadMedia(comprovante, `Comprovante PIX — ${nomeCompleto}`)
    }

    let comprovantePermanenciaId: string | undefined
    if (comprovantePermanencia instanceof File && comprovantePermanencia.size > 0) {
      comprovantePermanenciaId = await uploadPayloadMedia(
        comprovantePermanencia,
        `Comprovante permanência estudantil — ${nomeCompleto}`,
      )
    }

    const response = await fetch(`${PAYLOAD_URL}/api/submit-inscricao`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nomeCompleto,
        email: String(formData.get("email") || ""),
        cpf: String(formData.get("cpf") || ""),
        telefone: String(formData.get("telefone") || ""),
        ra: String(formData.get("ra") || ""),
        isUnesp: String(formData.get("isUnesp")) === "true",
        categoria: ticket.id,
        valorCentavos: ticket.priceCents,
        metodoPagamento: "pix",
        comprovanteId,
        comprovantePermanenciaId,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      const message =
        data?.errors?.[0]?.message || data?.error || data?.message || "Não foi possível salvar a inscrição."
      return NextResponse.json({ error: message }, { status: response.status })
    }

    return NextResponse.json({ ok: true, id: data.doc?.id, comprovanteId, comprovantePermanenciaId })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao enviar inscrição." },
      { status: 500 },
    )
  }
}
