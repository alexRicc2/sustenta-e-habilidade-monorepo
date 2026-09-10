"use client"

import { useId, useLayoutEffect, useMemo, useRef, useState, type DragEvent } from "react"
import {
  dietaryPreferences,
  pix,
  ticketRequiresProof,
  ticketTypes,
  type DietaryPreferenceId,
  type TicketTypeId,
} from "@/lib/event"
import { formatBRL } from "@/lib/money"

type FormState = {
  nomeCompleto: string
  email: string
  cpf: string
  telefone: string
  ra: string
  isUnesp: boolean
  preferenciaAlimentar: DietaryPreferenceId | ""
  categoria: TicketTypeId | ""
}

const initialState: FormState = {
  nomeCompleto: "",
  email: "",
  cpf: "",
  telefone: "",
  ra: "",
  isUnesp: false,
  preferenciaAlimentar: "",
  categoria: "",
}

const dietTooltip =
  "Esta informação será usada para definir o coffee break do evento, de acordo com a sua preferência alimentar."

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

function DietPreferenceField({
  value,
  onChange,
}: {
  value: DietaryPreferenceId | ""
  onChange: (value: DietaryPreferenceId) => void
}) {
  const [helpOpen, setHelpOpen] = useState(false)
  const helpRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!helpOpen) return

    function closeOnOutside(event: PointerEvent) {
      if (!helpRef.current?.contains(event.target as Node)) setHelpOpen(false)
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setHelpOpen(false)
    }

    document.addEventListener("pointerdown", closeOnOutside)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [helpOpen])

  return (
    <fieldset className="space-y-3">
      <div ref={helpRef} className="space-y-3">
        <div className="flex items-center gap-2">
          <legend className="text-sm font-semibold text-white/80">Preferência alimentar</legend>
          <button
            type="button"
            aria-label="O que é a preferência alimentar?"
            aria-expanded={helpOpen}
            aria-controls="diet-tooltip"
            onClick={() => setHelpOpen((current) => !current)}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/35 text-base font-extrabold text-sky hover:border-sky hover:bg-white/10"
          >
            ?
          </button>
        </div>
        {helpOpen ? (
          <p
            id="diet-tooltip"
            role="tooltip"
            className="rounded-2xl bg-white px-3.5 py-3 text-sm font-medium leading-6 text-forest shadow-lg"
          >
            {dietTooltip}
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
        {dietaryPreferences.map((item) => {
          const selected = value === item.id
          return (
            <label
              key={item.id}
              className={`flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border px-3 py-3 text-center text-sm font-extrabold transition ${
                selected ? "border-sky bg-white/10 text-white" : "border-white/15 text-white/80 hover:border-white/40"
              }`}
            >
              <input
                type="radio"
                name="preferenciaAlimentar"
                value={item.id}
                checked={selected}
                onChange={() => onChange(item.id)}
                className="sr-only"
              />
              {item.title}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className ?? ""}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

const acceptedFileTypes = "image/jpeg,image/png,image/webp,application/pdf"

function isAcceptedFile(file: File) {
  return (
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp" ||
    file.type === "application/pdf" ||
    /\.(jpe?g|png|webp|pdf)$/i.test(file.name)
  )
}

function isImageFile(file: File) {
  return file.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(file.name)
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 16V7m0 0-3.5 3.5M12 7l3.5 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 16.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PdfBadge() {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-3 bg-cream px-4 py-6 text-forest">
      <span className="rounded-lg bg-forest px-3 py-1 text-xs font-extrabold tracking-[0.2em] text-white">PDF</span>
      <p className="text-sm font-semibold text-forest/70">Documento anexado</p>
    </div>
  )
}

const previewUrls = new WeakMap<File, string>()

function previewUrlFor(file: File) {
  const existing = previewUrls.get(file)
  if (existing) return existing
  const url = URL.createObjectURL(file)
  previewUrls.set(file, url)
  return url
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
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const previewUrl = file ? previewUrlFor(file) : null

  function assign(next: File | null) {
    if (next && !isAcceptedFile(next)) return
    onFile(next)
    if (!next && inputRef.current) inputRef.current.value = ""
  }

  function endDrag(event: DragEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false)
  }

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={endDrag}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        const dropped = event.dataTransfer.files?.[0]
        if (dropped) assign(dropped)
      }}
      className={`overflow-hidden rounded-2xl border-2 p-4 transition ${
        file
          ? "border-olive bg-olive/20"
          : dragging
            ? "border-sky border-dashed bg-white/10"
            : "border-dashed border-white/30"
      }`}
    >
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={acceptedFileTypes}
        aria-label={label}
        className="sr-only"
        onChange={(event) => assign(event.target.files?.[0] || null)}
      />

      {file && previewUrl ? (
        <div>
          <div className="flex items-center gap-2" role="status">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-olive text-sm font-extrabold text-forest">
              ✓
            </span>
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-olive">Arquivo anexado</p>
          </div>

          <div className="mt-3 overflow-hidden rounded-xl bg-white">
            {isImageFile(file) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt={`Prévia de ${file.name}`} className="mx-auto max-h-52 w-full object-contain" />
            ) : (
              <PdfBadge />
            )}
          </div>

          <p className="mt-3 truncate font-extrabold" title={file.name}>
            {file.name}
          </p>
          <p className="text-sm text-white/70">{formatFileSize(file.size)}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white/15 px-4 py-2 text-xs font-extrabold uppercase tracking-widest hover:bg-white/25"
            >
              Ver arquivo
            </a>
            <label
              htmlFor={inputId}
              className="cursor-pointer rounded-full bg-white/15 px-4 py-2 text-xs font-extrabold uppercase tracking-widest hover:bg-white/25"
            >
              Trocar arquivo
            </label>
            <button
              type="button"
              onClick={() => assign(null)}
              className="rounded-full border border-white/25 px-4 py-2 text-xs font-extrabold uppercase tracking-widest hover:border-white/50"
            >
              Remover
            </button>
          </div>
        </div>
      ) : (
        <label htmlFor={inputId} className="flex min-h-48 cursor-pointer flex-col items-center justify-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/5 text-sky">
            <UploadIcon className="h-7 w-7" />
          </span>
          <p className="mt-4 font-extrabold">{label}</p>
          <p className="mt-2 text-sm text-white/70">
            {dragging ? "Solte o arquivo para anexar." : "Clique ou arraste o arquivo aqui. JPG, PNG ou PDF."}
          </p>
          {hint ? <p className="mt-3 text-xs text-white/50">{hint}</p> : null}
        </label>
      )}
    </div>
  )
}

export function InscriptionForm({ onSuccess }: { onSuccess?: () => void } = {}) {
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
  const diet = dietaryPreferences.find((item) => item.id === form.preferenciaAlimentar)
  const needsProof = Boolean(ticket && ticketRequiresProof(ticket.id))
  const baseCents = ticket?.priceCents ?? 0

  const canNext = useMemo(() => {
    if (step === 0) {
      return (
        form.nomeCompleto.trim().length > 3 &&
        form.email.includes("@") &&
        onlyDigits(form.cpf).length === 11 &&
        onlyDigits(form.telefone).length >= 10 &&
        Boolean(form.preferenciaAlimentar)
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
    if (!ticket || !comprovante || !form.preferenciaAlimentar) return
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
      payload.set("preferenciaAlimentar", form.preferenciaAlimentar)
      payload.set("categoria", ticket.id)
      payload.set("comprovante", comprovante)
      if (comprovantePermanencia) {
        payload.set("comprovantePermanencia", comprovantePermanencia)
      }
      const response = await fetch("/api/inscricoes", { method: "POST", body: payload })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Não foi possível enviar a inscrição.")
      setSuccess(true)
      onSuccess?.()
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
            <DietPreferenceField
              value={form.preferenciaAlimentar}
              onChange={(next) => update("preferenciaAlimentar", next)}
            />
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
              {diet ? (
                <div className="mt-3 flex justify-between gap-4 text-white/75">
                  <span>Coffee break</span>
                  <span>{diet.title}</span>
                </div>
              ) : null}
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
