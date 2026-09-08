import { NextResponse } from "next/server"
import { ticketTypes } from "@/lib/event"

const PAYLOAD_URL = process.env.PAYLOAD_URL || "http://localhost:3001"

async function uploadComprovante(file: File, nomeCompleto: string) {
  const mediaForm = new FormData()
  mediaForm.append("file", file, file.name)
  mediaForm.append(
    "_payload",
    JSON.stringify({
      alt: `Comprovante PIX — ${nomeCompleto}`,
    }),
  )

  const response = await fetch(`${PAYLOAD_URL}/api/media`, {
    method: "POST",
    body: mediaForm,
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.errors?.[0]?.message || data?.message || "Falha ao enviar o comprovante para o R2.")
  }
  const id = data.doc?.id || data.id
  if (!id) {
    throw new Error("Upload do comprovante não retornou um ID.")
  }
  return String(id)
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const categoria = String(formData.get("categoria") || "")
  const ticket = ticketTypes.find((item) => item.id === categoria)
  const nomeCompleto = String(formData.get("nomeCompleto") || "")
  const comprovante = formData.get("comprovante")

  if (!ticket) {
    return NextResponse.json({ error: "Selecione um ingresso válido." }, { status: 400 })
  }

  try {
    let comprovanteId: string | undefined
    if (comprovante && typeof comprovante !== "string" && comprovante.size > 0) {
      const file =
        comprovante instanceof File
          ? comprovante
          : new File([comprovante], "comprovante", { type: comprovante.type || "image/jpeg" })
      comprovanteId = await uploadComprovante(file, nomeCompleto)
    }

    const response = await fetch(`${PAYLOAD_URL}/api/submit-inscricao`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nomeCompleto,
        email: String(formData.get("email") || ""),
        cpf: String(formData.get("cpf") || ""),
        telefone: String(formData.get("telefone") || ""),
        instituicao: String(formData.get("instituicao") || ""),
        ra: String(formData.get("ra") || ""),
        isUnesp: String(formData.get("isUnesp")) === "true",
        categoria: ticket.id,
        valorCentavos: ticket.priceCents,
        metodoPagamento: "pix",
        comprovanteId,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      const message =
        data?.errors?.[0]?.message || data?.error || data?.message || "Não foi possível salvar a inscrição."
      return NextResponse.json({ error: message }, { status: response.status })
    }

    return NextResponse.json({ ok: true, id: data.doc?.id, comprovanteId })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao enviar inscrição." },
      { status: 500 },
    )
  }
}
