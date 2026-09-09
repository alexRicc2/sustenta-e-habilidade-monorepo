'use client'

import { useDocumentInfo, useField } from '@payloadcms/ui'

function paddedNumero(numero: unknown) {
  const value = Number(numero)
  if (!Number.isFinite(value)) return '000'
  return String(value).padStart(3, '0')
}

export function DownloadQrcodeCell({ rowData }: { rowData?: { id?: string; numero?: number } }) {
  const id = rowData?.id
  if (!id) return null

  const numero = paddedNumero(rowData.numero)

  return (
    <a
      href={`/api/qrcodes/${id}/png?download=1`}
      download={`qrcode-${numero}.png`}
      onClick={(event) => event.stopPropagation()}
      style={{ fontWeight: 600 }}
    >
      Baixar PNG
    </a>
  )
}

export function DownloadQrcodeField() {
  const { id } = useDocumentInfo()
  const { value: numero } = useField<number>({ path: 'numero' })
  if (!id) return null

  const label = paddedNumero(numero)

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 280 }}>
      <p style={{ margin: 0, fontWeight: 600 }}>Arquivo do QR Code</p>
      <img
        src={`/api/qrcodes/${id}/png`}
        alt={`QR Code ${label}`}
        width={240}
        height={240}
        style={{
          width: 240,
          height: 240,
          background: '#fff',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 12,
        }}
      />
      <a
        href={`/api/qrcodes/${id}/png?download=1`}
        download={`qrcode-${label}.png`}
        style={{ fontWeight: 600 }}
      >
        Baixar PNG {label}
      </a>
    </div>
  )
}
