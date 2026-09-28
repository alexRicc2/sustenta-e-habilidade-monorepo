'use client'

import Link from 'next/link'
import { PRESENCA_EVENTO_OPTIONS } from '@/lib/presenca-eventos'

export function PresencasListHeader() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: '0 0 14px',
      }}
    >
      <p style={{ margin: 0, color: 'var(--theme-elevation-600)', fontSize: 13, maxWidth: 520 }}>
        Filtre pelo campo <strong>Intervalo</strong> para ver quem voltou em cada momento do dia.
        Edite qualquer registro pela lista.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <Link
          href="/admin/ler-qrcode"
          prefetch={false}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--theme-elevation-800)',
            color: 'var(--theme-elevation-0)',
            textDecoration: 'none',
            borderRadius: 6,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Ler QR Code
        </Link>
        <select
          defaultValue=""
          aria-label="Atalho de filtro por intervalo"
          onChange={(event) => {
            const value = event.target.value
            if (!value) {
              window.location.href = '/admin/collections/presencas'
              return
            }
            const where = encodeURIComponent(JSON.stringify({ evento: { equals: value } }))
            window.location.href = `/admin/collections/presencas?where=${where}`
          }}
          style={{
            minWidth: 260,
            padding: '8px 10px',
            borderRadius: 6,
            border: '1px solid var(--theme-elevation-250)',
            background: 'var(--theme-elevation-0)',
            color: 'var(--theme-elevation-800)',
            fontSize: 13,
          }}
        >
          <option value="">Todos os intervalos</option>
          {PRESENCA_EVENTO_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
