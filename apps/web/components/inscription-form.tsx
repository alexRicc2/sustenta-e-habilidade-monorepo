"use client"

import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { pix, ticketRequiresProof, ticketTypes, type TicketTypeId } from "@/lib/event"
import { formatBRL } from "@/lib/money"

type FormState = {
  nomeCompleto: string
  email: string
  cpf: string
  telefone: string
  ra: string
  isUnesp: boolean
  categoria: TicketTypeId | ""
}

const initialState: FormState = {
  nomeCompleto: "",
  email: "",
  cpf: "",
  telefone: "",
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

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className ?? ""}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function FileDrop({
  label,
  hint,
  file,
  onFile,
}: {
  label: string
  hint?: string
  file: File | null
  onFile: (file: File | null) => void
}) {
  return (
    <label
      className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/30 p-6 text-center"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        const dropped = event.dataTransfer.files?.[0]
        if (dropped) onFile(dropped)
      }}
    >
      <p className="font-extrabold">{label}</p>
      <p className="mt-2 text-sm text-white/70">
        {file ? file.name : "Clique ou arraste o arquivo aqui. JPG, PNG ou PDF."}
      </p>
      {hint ? <p className="mt-3 text-xs text-white/50">{hint}</p> : null}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(event) => onFile(event.target.files?.[0] || null)}
      />
    </label>
  )
}

export function InscriptionForm() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(initialState)
  const [comprovante, setComprovante] = useState<File | null>(null)
  const [comprovantePermanencia, setComprovantePermanencia] = useState<File | null>(null)
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!success) return
    const target = document.getElementById("inscricao") ?? rootRef.current
    target?.scrollIntoView({ behavior: "instant", block: "start" })
  }, [success])

  const ticket = ticketTypes.find((item) => item.id === form.categoria)
  const needsProof = Boolean(ticket && ticketRequiresProof(ticket.id))
  const baseCents = ticket?.priceCents ?? 0

  const canNext = useMemo(() => {
    if (step === 0) {
      return (
        form.nomeCompleto.trim().length > 3 &&
        form.email.includes("@") &&
        onlyDigits(form.cpf).length === 11 &&
        onlyDigits(form.telefone).length >= 10
      )
    }
    if (step === 1) {
      if (!form.categoria) return false
      if (ticketRequiresProof(form.categoria) && !comprovantePermanencia) return false
      return true
    }
    return Boolean(comprovante)
  }, [form, step, comprovante, comprovantePermanencia])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function copyPix() {
    await navigator.clipboard.writeText(pix.key)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  async function submitPix() {
    if (!ticket || !comprovante) return
    if (ticketRequiresProof(ticket.id) && !comprovantePermanencia) return
    setSubmitting(true)
    setError("")
    try {
      const payload = new FormData()
      payload.set("nomeCompleto", form.nomeCompleto)
      payload.set("email", form.email)
      payload.set("cpf", onlyDigits(form.cpf))
      payload.set("telefone", onlyDigits(form.telefone))
      payload.set("ra", form.ra)
      payload.set("isUnesp", form.isUnesp ? "true" : "false")
      payload.set("categoria", ticket.id)
      payload.set("comprovante", comprovante)
      if (comprovantePermanencia) {
        payload.set("comprovantePermanencia", comprovantePermanencia)
      }
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
    const successCopy = needsProof
      ? "Recebemos seu comprovante PIX e o comprovante de permanência estudantil. A organização vai analisar os documentos e confirmar para"
      : "Recebemos seu comprovante PIX. A organização vai conferir o pagamento e confirmar para"

    return (
      <div ref={rootRef} className="rounded-[28px] bg-forest p-8 text-center text-white md:p-12">
        <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-sky">Inscrição recebida</p>
        <h2 className="mt-4 font-display text-3xl">Obrigado, {form.nomeCompleto.split(" ")[0]}!</h2>
        <p className="mt-4 text-white/80">
          {successCopy} <strong>{form.email}</strong>.
        </p>
        <p className="mt-4 text-sm text-white/70">
          Se o e-mail não aparecer na caixa de entrada, verifique também a pasta de spam ou lixo eletrônico.
        </p>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      aria-busy={submitting}
      className="relative overflow-hidden rounded-[28px] bg-forest text-white shadow-2xl"
    >
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
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.isUnesp}
                onChange={(event) => update("isUnesp", event.target.checked)}
                className="h-4 w-4 cursor-pointer accent-olive"
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
                  if (!ticketRequiresProof(item.id)) setComprovantePermanencia(null)
                }}
                className={`cursor-pointer rounded-2xl border p-5 text-left transition ${
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
            {needsProof ? (
              <FileDrop
                label="Comprovante de permanência estudantil"
                hint="Documento que comprove o vínculo com a permanência estudantil."
                file={comprovantePermanencia}
                onFile={setComprovantePermanencia}
              />
            ) : null}
          </div>
        ) : null}

        {step === 2 && ticket ? (
          <div className="mt-10 space-y-6">
            <div className="rounded-2xl bg-white/8 p-5 text-sm">
              <div className="flex justify-between gap-4">
                <span>{ticket.title} × 1</span>
                <span>{formatBRL(baseCents)}</span>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-white/15 pt-4">
                <span className="font-extrabold uppercase tracking-widest">Total</span>
                <span className="font-display text-3xl text-sky">{formatBRL(baseCents)}</span>
              </div>
            </div>

            {needsProof ? (
              <p className="rounded-2xl bg-white/8 p-4 text-sm text-white/80">
                Esta categoria fica pendente de aprovação da organização.
                {comprovantePermanencia ? ` Comprovante anexado: ${comprovantePermanencia.name}.` : ""}
              </p>
            ) : null}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 text-center text-forest">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pix.qrSrc} alt="QR Code Pix" className="mx-auto h-56 w-56 object-contain" />
                <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-forest/55">
                  Destinatário
                </p>
                <p className="mt-1 text-sm font-extrabold leading-snug">{pix.recipient}</p>
                <p className="mt-2 break-all text-xs font-semibold text-forest/70">{pix.key}</p>
                <button
                  type="button"
                  onClick={() => void copyPix()}
                  className="mt-3 w-full cursor-pointer rounded-full bg-forest px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-white"
                >
                  {copied ? "Copiado" : "Copiar chave Pix"}
                </button>
              </div>
              <FileDrop
                label="Comprovante de pagamento"
                hint={`Pague o valor exato de ${formatBRL(baseCents)} via Pix e anexe o comprovante.`}
                file={comprovante}
                onFile={setComprovante}
              />
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-6 text-sm text-red-200">{error}</p> : null}

        <div className="mt-10 flex gap-3">
          {step > 0 ? (
            <button
              type="button"
              disabled={submitting}
              onClick={() => setStep((current) => current - 1)}
              className="cursor-pointer rounded-2xl border border-white/20 px-5 py-4 font-extrabold uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-40"
            >
              Voltar
            </button>
          ) : null}
          {step < 2 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep((current) => current + 1)}
              className="flex-1 cursor-pointer rounded-2xl bg-olive py-4 font-extrabold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Próxima etapa
            </button>
          ) : (
            <button
              type="button"
              disabled={!canNext || submitting}
              onClick={() => void submitPix()}
              className="flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-2xl bg-olive py-4 font-extrabold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <Spinner className="h-5 w-5" />
                  Enviando...
                </>
              ) : (
                "Finalizar inscrição"
              )}
            </button>
          )}
        </div>
      </div>

      {submitting ? (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-forest/80 backdrop-blur-[2px]"
          role="status"
          aria-live="polite"
        >
          <Spinner className="h-10 w-10 text-sky" />
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-white">
            Enviando sua inscrição...
          </p>
        </div>
      ) : null}
    </div>
  )
}
