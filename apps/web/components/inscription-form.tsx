"use client"

import dynamic from "next/dynamic"
import { useCallback, useMemo, useState } from "react"
import { pix, ticketTypes, type TicketTypeId } from "@/lib/event"
import { CARD_FEE_RATE, cardTotalCents, centsToAmount, formatBRL } from "@/lib/money"
import type { MercadoPagoCardFormData } from "@/components/mercado-pago-embed"

const MercadoPagoEmbed = dynamic(
  () => import("@/components/mercado-pago-embed").then((mod) => mod.MercadoPagoEmbed),
  {
    ssr: false,
    loading: () => (
      <p className="rounded-2xl bg-white/10 p-4 text-sm text-white/80">Carregando checkout do cartão...</p>
    ),
  },
)

type FormState = {
  nomeCompleto: string
  email: string
  cpf: string
  telefone: string
  instituicao: string
  ra: string
  isUnesp: boolean
  categoria: TicketTypeId | ""
}

type PaymentMethod = "pix" | "cartao"

const initialState: FormState = {
  nomeCompleto: "",
  email: "",
  cpf: "",
  telefone: "",
  instituicao: "",
  ra: "",
  isUnesp: false,
  categoria: "",
}

const steps = ["Seus dados", "Ingresso", "Pagamento"] as const

function onlyDigits(value: string) {
  return value.replace(/\D/g, "")
}

function maskCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11)
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2")
  }
  return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2")
}

export function InscriptionForm() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(initialState)
  const [method, setMethod] = useState<PaymentMethod>("pix")
  const [comprovante, setComprovante] = useState<File | null>(null)
  const [copied, setCopied] = useState(false)
  const [cardPaid, setCardPaid] = useState(false)
  const [cardStatus, setCardStatus] = useState<"approved" | "pending">("approved")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const ticket = ticketTypes.find((item) => item.id === form.categoria)
  const baseCents = ticket?.priceCents ?? 0
  const cardCents = cardTotalCents(baseCents)
  const chargeCents = method === "cartao" ? cardCents : baseCents
  const feeCents = cardCents - baseCents

  const canNext = useMemo(() => {
    if (step === 0) {
      return (
        form.nomeCompleto.trim().length > 3 &&
        form.email.includes("@") &&
        onlyDigits(form.cpf).length === 11 &&
        onlyDigits(form.telefone).length >= 10
      )
    }
    if (step === 1) return Boolean(form.categoria)
    if (method === "pix") return Boolean(comprovante)
    return cardPaid
  }, [form, step, method, comprovante, cardPaid])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function copyPix() {
    await navigator.clipboard.writeText(pix.key)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const onCardSubmit = useCallback(
    async (cardFormData: MercadoPagoCardFormData) => {
      setError("")
      const response = await fetch("/api/mercado-pago/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          cpf: onlyDigits(form.cpf),
          telefone: onlyDigits(form.telefone),
          cardFormData,
        }),
      })
      const data = (await response.json()) as {
        error?: string
        status?: string
      }
      if (data.status === "approved" || data.status === "in_process" || data.status === "pending") {
        setCardPaid(true)
        setCardStatus(data.status === "approved" ? "approved" : "pending")
        setSuccess(true)
        return
      }
      setError(data.error || "Não foi possível concluir o pagamento.")
      return Promise.reject()
    },
    [form],
  )

  async function submitPix() {
    if (!ticket || !comprovante) return
    setSubmitting(true)
    setError("")
    try {
      const payload = new FormData()
      payload.set("nomeCompleto", form.nomeCompleto)
      payload.set("email", form.email)
      payload.set("cpf", onlyDigits(form.cpf))
      payload.set("telefone", onlyDigits(form.telefone))
      payload.set("instituicao", form.instituicao)
      payload.set("ra", form.ra)
      payload.set("isUnesp", form.isUnesp ? "true" : "false")
      payload.set("categoria", ticket.id)
      payload.set("comprovante", comprovante)
      const response = await fetch("/api/inscricoes", { method: "POST", body: payload })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Não foi possível enviar a inscrição.")
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-[28px] bg-forest p-8 text-center text-white md:p-12">
        <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-sky">Inscrição recebida</p>
        <h2 className="mt-4 font-display text-3xl">Obrigado, {form.nomeCompleto.split(" ")[0]}!</h2>
        <p className="mt-4 text-white/80">
          {method === "cartao"
            ? cardStatus === "approved"
              ? "Pagamento com cartão confirmado. Enviaremos os detalhes para"
              : "Recebemos seu pagamento. Assim que o Mercado Pago confirmar, enviaremos os detalhes para"
            : "Recebemos seu comprovante PIX. A organização vai conferir o pagamento e confirmar para"}{" "}
          <strong>{form.email}</strong>.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[28px] bg-forest text-white shadow-2xl">
      <div className="bg-olive py-4 text-center text-sm font-extrabold uppercase tracking-[0.18em]">
        Inscrever-se
      </div>

      <div className="px-4 py-8 sm:px-6 md:px-10">
        <p className="text-center font-display text-3xl">II Sustenta &amp; Habilidade</p>
        <p className="mt-1 text-center text-xs font-bold uppercase tracking-[0.22em] text-mint">
          05 e 06 de outubro de 2026
        </p>

        <ol className="mt-8 grid grid-cols-3 text-center text-[10px] font-extrabold uppercase tracking-[0.08em] text-white/50 sm:tracking-[0.14em] md:text-xs">
          {steps.map((label, index) => (
            <li key={label} className="relative flex min-w-0 flex-col items-center gap-2 px-1">
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={`pointer-events-none absolute top-3.5 left-[calc(50%+16px)] right-[calc(-50%+16px)] h-px ${
                    index < step ? "bg-olive/80" : "bg-white/20"
                  }`}
                />
              ) : null}
              <span
                aria-current={index === step ? "step" : undefined}
                className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                  index === step
                    ? "border-sky bg-white text-forest"
                    : index < step
                      ? "border-olive text-olive"
                      : "border-white/30"
                }`}
              >
                {index < step ? "✓" : index + 1}
              </span>
              <span className={`leading-tight ${index === step ? "text-sky" : ""}`}>{label}</span>
            </li>
          ))}
        </ol>

        {step === 0 ? (
          <div className="mt-10 space-y-6">
            <label className="block text-sm font-semibold text-white/80">
              Nome completo
              <input
                className="input-line mt-1"
                value={form.nomeCompleto}
                onChange={(event) => update("nomeCompleto", event.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-semibold text-white/80">
              E-mail
              <input
                type="email"
                className="input-line mt-1"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                required
              />
            </label>
            <div className="grid gap-6 md:grid-cols-3">
              <label className="block text-sm font-semibold text-white/80">
                CPF
                <input
                  className="input-line mt-1"
                  value={form.cpf}
                  onChange={(event) => update("cpf", maskCpf(event.target.value))}
                  required
                />
              </label>
              <label className="block text-sm font-semibold text-white/80">
                Telefone
                <input
                  className="input-line mt-1"
                  value={form.telefone}
                  onChange={(event) => update("telefone", maskPhone(event.target.value))}
                  required
                />
              </label>
              <label className="block text-sm font-semibold text-white/80">
                RA (opcional)
                <input
                  className="input-line mt-1"
                  value={form.ra}
                  onChange={(event) => update("ra", event.target.value)}
                />
              </label>
            </div>
            <label className="block text-sm font-semibold text-white/80">
              Instituição
              <input
                className="input-line mt-1"
                value={form.instituicao}
                onChange={(event) => update("instituicao", event.target.value)}
              />
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.isUnesp}
                onChange={(event) => update("isUnesp", event.target.checked)}
                className="h-4 w-4 accent-olive"
              />
              Sou da UNESP
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="mt-10 grid gap-4">
            {ticketTypes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  update("categoria", item.id)
                  setCardPaid(false)
                }}
                className={`rounded-2xl border p-5 text-left transition ${
                  form.categoria === item.id ? "border-sky bg-white/10" : "border-white/15 hover:border-white/40"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-extrabold">{item.title}</p>
                    <p className="mt-1 text-sm text-white/70">{item.description}</p>
                  </div>
                  <p className="font-display text-xl text-sky">{formatBRL(item.priceCents)}</p>
                </div>
              </button>
            ))}
          </div>
        ) : null}

        {step === 2 && ticket ? (
          <div className="mt-10 space-y-6">
            <div className="rounded-2xl bg-white/8 p-5 text-sm">
              <div className="flex justify-between gap-4">
                <span>
                  {ticket.title} × 1
                </span>
                <span>{formatBRL(baseCents)}</span>
              </div>
              {method === "cartao" ? (
                <div className="mt-2 flex justify-between gap-4 text-white/70">
                  <span>Taxa do cartão ({Math.round(CARD_FEE_RATE * 100)}%)</span>
                  <span>{formatBRL(feeCents)}</span>
                </div>
              ) : null}
              <div className="mt-4 flex items-end justify-between border-t border-white/15 pt-4">
                <span className="font-extrabold uppercase tracking-widest">Total</span>
                <span className="font-display text-3xl text-sky">{formatBRL(chargeCents)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMethod("pix")
                  setError("")
                }}
                className={`rounded-2xl py-3 text-sm font-extrabold uppercase tracking-widest ${
                  method === "pix" ? "bg-olive" : "bg-white/10"
                }`}
              >
                Pix
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod("cartao")
                  setError("")
                }}
                className={`rounded-2xl py-3 text-sm font-extrabold uppercase tracking-widest ${
                  method === "cartao" ? "bg-olive" : "bg-white/10"
                }`}
              >
                Cartão de crédito
              </button>
            </div>

            {method === "pix" ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 text-center text-forest">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pix.qrSrc} alt="QR Code Pix" className="mx-auto h-56 w-56 object-contain" />
                  <p className="mt-3 break-all text-xs font-semibold">{pix.key}</p>
                  <button
                    type="button"
                    onClick={() => void copyPix()}
                    className="mt-3 w-full rounded-full bg-forest px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-white"
                  >
                    {copied ? "Copiado" : "Copiar chave Pix"}
                  </button>
                </div>
                <label
                  className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/30 p-6 text-center"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    const file = event.dataTransfer.files?.[0]
                    if (file) setComprovante(file)
                  }}
                >
                  <p className="font-extrabold">Comprovante de pagamento</p>
                  <p className="mt-2 text-sm text-white/70">
                    {comprovante
                      ? comprovante.name
                      : "Clique ou arraste o comprovante aqui. JPG, PNG ou PDF."}
                  </p>
                  <p className="mt-3 text-xs text-white/50">Pague o valor exato de {formatBRL(baseCents)} e anexe o comprovante.</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={(event) => setComprovante(event.target.files?.[0] || null)}
                  />
                </label>
              </div>
            ) : (
              <MercadoPagoEmbed
                key={`${ticket.id}-${cardCents}`}
                amount={centsToAmount(cardCents)}
                email={form.email}
                cpf={onlyDigits(form.cpf)}
                onSubmitPayment={onCardSubmit}
                onError={setError}
              />
            )}
          </div>
        ) : null}

        {error ? <p className="mt-6 text-sm text-red-200">{error}</p> : null}

        <div className="mt-10 flex gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((current) => current - 1)}
              className="rounded-2xl border border-white/20 px-5 py-4 font-extrabold uppercase tracking-widest"
            >
              Voltar
            </button>
          ) : null}
          {step < 2 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep((current) => current + 1)}
              className="flex-1 rounded-2xl bg-olive py-4 font-extrabold uppercase tracking-[0.18em] disabled:opacity-40"
            >
              Próxima etapa
            </button>
          ) : method === "pix" ? (
            <button
              type="button"
              disabled={!canNext || submitting}
              onClick={() => void submitPix()}
              className="flex-1 rounded-2xl bg-olive py-4 font-extrabold uppercase tracking-[0.18em] disabled:opacity-40"
            >
              {submitting ? "Enviando..." : "Finalizar inscrição"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
