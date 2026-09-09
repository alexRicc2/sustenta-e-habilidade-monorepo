'use client'

import { toast } from '@payloadcms/ui'
import { useEffect, useState, type CSSProperties } from 'react'

const buttonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  background: 'var(--theme-elevation-800)',
  color: 'var(--theme-elevation-0)',
  textDecoration: 'none',
  border: 0,
  borderRadius: 6,
  padding: '8px 14px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
}

export function PrintQrcodes() {
  const [seeding, setSeeding] = useState(true)
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function seed() {
      try {
        const response = await fetch('/api/qrcodes-seed', {
          method: 'POST',
          credentials: 'include',
        })
        const data = (await response.json()) as {
          created?: number
          total?: number
          errors?: { message?: string }[]
          message?: string
        }
        if (!response.ok) {
          throw new Error(data.errors?.[0]?.message || data.message || 'Falha ao gerar os QR Codes.')
        }
        if (cancelled) return
        setTotal(data.total ?? 0)
        if ((data.created ?? 0) > 0) {
          toast.success(`${data.created} QR Codes gerados.`)
          window.location.reload()
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : 'Falha ao gerar os QR Codes.')
        }
      } finally {
        if (!cancelled) setSeeding(false)
      }
    }

    void seed()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        gap: 8,
        margin: '0 0 12px',
        alignItems: 'center',
      }}
    >
      {seeding ? (
        <span style={{ color: 'var(--theme-elevation-600)', fontSize: 13 }}>Gerando 150 QR Codes...</span>
      ) : null}
      {total !== null && !seeding ? (
        <span style={{ color: 'var(--theme-elevation-600)', fontSize: 13 }}>{total} QR Codes no pool</span>
      ) : null}
      <a href="/api/qrcodes-download-zip" style={buttonStyle}>
        Baixar todos (ZIP)
      </a>
      <a href="/api/qrcodes-folha-impressao" target="_blank" rel="noreferrer" style={buttonStyle}>
        Folha de impressão
      </a>
    </div>
  )
}
