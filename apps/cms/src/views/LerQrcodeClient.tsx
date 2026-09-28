'use client'

import { toast } from '@payloadcms/ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PRESENCA_EVENTO_OPTIONS, type PresencaEvento } from '@/lib/presenca-eventos'

type CheckinResponse = {
  ok?: boolean
  alreadyRegistered?: boolean
  message?: string
  errors?: { message?: string }[]
  participante?: { id: string; name: string }
}

type JsQRFn = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options?: { inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' | 'invertFirst' },
) => { data: string } | null

declare global {
  interface Window {
    jsQR?: JsQRFn
  }
}

let jsQRPromise: Promise<JsQRFn> | null = null

function loadJsQR(): Promise<JsQRFn> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('jsQR só funciona no navegador.'))
  }
  if (window.jsQR) return Promise.resolve(window.jsQR)
  if (jsQRPromise) return jsQRPromise

  jsQRPromise = new Promise<JsQRFn>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-jsqr="1"]')
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.jsQR) resolve(window.jsQR)
        else reject(new Error('jsQR não carregou.'))
      })
      existing.addEventListener('error', () => reject(new Error('Falha ao carregar jsQR.')))
      return
    }

    const script = document.createElement('script')
    script.src = '/vendor/jsQR.js'
    script.async = true
    script.dataset.jsqr = '1'
    script.onload = () => {
      if (window.jsQR) resolve(window.jsQR)
      else reject(new Error('jsQR não carregou.'))
    }
    script.onerror = () => reject(new Error('Falha ao carregar jsQR.'))
    document.head.appendChild(script)
  })

  return jsQRPromise
}

/** Short two-tone chime after a successful QR read. */
function playCompleteSound() {
  try {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + start)
      gain.gain.setValueAtTime(0.0001, now + start)
      gain.gain.exponentialRampToValueAtTime(0.18, now + start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + start)
      osc.stop(now + start + duration + 0.02)
    }

    playTone(880, 0, 0.12)
    playTone(1318.5, 0.1, 0.18)

    window.setTimeout(() => {
      void ctx.close()
    }, 500)
  } catch {
    // ignore audio errors (autoplay policies, etc.)
  }
}

export function LerQrcodeClient() {
  const [evento, setEvento] = useState<PresencaEvento>('d1-antes-coffee')
  const [scanning, setScanning] = useState(false)
  const [busy, setBusy] = useState(false)
  const [manualCodigo, setManualCodigo] = useState('')
  const [lastMessage, setLastMessage] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const jsQRRef = useRef<JsQRFn | null>(null)
  const eventoRef = useRef(evento)
  const busyRef = useRef(false)
  const lastCodeRef = useRef<{ codigo: string; at: number } | null>(null)

  useEffect(() => {
    eventoRef.current = evento
  }, [evento])

  const stopScanner = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop()
      }
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setScanning(false)
  }, [])

  const registerPresenca = useCallback(async (codigoRaw: string) => {
    const codigo = String(codigoRaw || '').trim().toLowerCase()
    if (!codigo || busyRef.current) return

    const now = Date.now()
    if (
      lastCodeRef.current &&
      lastCodeRef.current.codigo === codigo &&
      now - lastCodeRef.current.at < 4000
    ) {
      return
    }
    lastCodeRef.current = { codigo, at: now }
    busyRef.current = true
    setBusy(true)

    try {
      const response = await fetch('/api/presencas-checkin', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, evento: eventoRef.current }),
      })
      const data = (await response.json()) as CheckinResponse
      if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || data.message || 'Falha ao registrar presença.')
      }

      const message = data.message || 'Presença registrada.'
      setLastMessage(message)
      playCompleteSound()
      if (data.alreadyRegistered) {
        toast.info(message)
      } else {
        toast.success(message)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao registrar presença.'
      setLastMessage(message)
      toast.error(message)
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }, [])

  const scanLoop = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const decode = jsQRRef.current
    if (!video || !canvas || !decode || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanLoop)
      return
    }

    const width = video.videoWidth
    const height = video.videoHeight
    if (width && height) {
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height)
        const imageData = ctx.getImageData(0, 0, width, height)
        const code = decode(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        })
        if (code?.data) {
          void registerPresenca(code.data)
        }
      }
    }

    rafRef.current = requestAnimationFrame(scanLoop)
  }, [registerPresenca])

  const startScanner = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Este navegador não permite acesso à câmera. Cole o UUID manualmente.')
      return
    }

    stopScanner()

    try {
      jsQRRef.current = await loadJsQR()
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)
      rafRef.current = requestAnimationFrame(scanLoop)
    } catch (error) {
      stopScanner()
      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível acessar a câmera. Permita o uso no navegador (cadeado na barra de endereço).',
      )
    }
  }, [scanLoop, stopScanner])

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [stopScanner])

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 40 }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 28 }}>Ler QR Code</h1>
      <p style={{ margin: '0 0 20px', color: 'var(--theme-elevation-600)', lineHeight: 1.45 }}>
        Selecione o intervalo do dia e aponte a câmera para o crachá quando a pessoa retornar.
        Somente QR Codes atribuídos a inscrições pagas são aceitos.
      </p>

      <label
        style={{
          display: 'block',
          marginBottom: 8,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--theme-elevation-700)',
        }}
      >
        Intervalo
      </label>
      <select
        value={evento}
        onChange={(event) => setEvento(event.target.value as PresencaEvento)}
        style={{
          width: '100%',
          maxWidth: 420,
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid var(--theme-elevation-250)',
          background: 'var(--theme-elevation-0)',
          color: 'var(--theme-elevation-800)',
          marginBottom: 16,
          fontSize: 14,
        }}
      >
        {PRESENCA_EVENTO_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {!scanning ? (
          <button
            type="button"
            onClick={() => void startScanner()}
            style={{
              background: 'var(--theme-elevation-800)',
              color: 'var(--theme-elevation-0)',
              border: 0,
              borderRadius: 8,
              padding: '10px 16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Abrir câmera
          </button>
        ) : (
          <button
            type="button"
            onClick={stopScanner}
            style={{
              background: 'var(--theme-error-500)',
              color: '#fff',
              border: 0,
              borderRadius: 8,
              padding: '10px 16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Parar câmera
          </button>
        )}
        <a
          href="/admin/collections/presencas"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 8,
            padding: '10px 16px',
            border: '1px solid var(--theme-elevation-250)',
            textDecoration: 'none',
            color: 'var(--theme-elevation-800)',
            fontWeight: 600,
          }}
        >
          Ver presenças
        </a>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 480,
          aspectRatio: '3 / 4',
          overflow: 'hidden',
          borderRadius: 12,
          background: '#111',
          display: scanning ? 'block' : 'none',
          position: 'relative',
        }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          void registerPresenca(manualCodigo)
          setManualCodigo('')
        }}
        style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}
      >
        <input
          value={manualCodigo}
          onChange={(event) => setManualCodigo(event.target.value)}
          placeholder="Cole o UUID do QR (fallback)"
          style={{
            flex: '1 1 240px',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid var(--theme-elevation-250)',
            background: 'var(--theme-elevation-0)',
            color: 'var(--theme-elevation-800)',
          }}
        />
        <button
          type="submit"
          disabled={busy || !manualCodigo.trim()}
          style={{
            background: 'var(--theme-elevation-800)',
            color: 'var(--theme-elevation-0)',
            border: 0,
            borderRadius: 8,
            padding: '10px 16px',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: busy || !manualCodigo.trim() ? 0.6 : 1,
          }}
        >
          Registrar
        </button>
      </form>

      {busy ? (
        <p style={{ marginTop: 12, color: 'var(--theme-elevation-600)' }}>Registrando presença...</p>
      ) : null}
      {lastMessage ? (
        <p style={{ marginTop: 12, color: 'var(--theme-elevation-800)', fontWeight: 600 }}>
          {lastMessage}
        </p>
      ) : null}
    </div>
  )
}
