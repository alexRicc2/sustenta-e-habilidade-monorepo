'use client'

import { Button, toast, useDocumentInfo, useField } from '@payloadcms/ui'
import { useState } from 'react'

export function SendConfirmationEmail() {
  const { id } = useDocumentInfo()
  const { value: metodoPagamento } = useField<string>({ path: 'metodoPagamento' })
  const { value: jaEnviado, setValue: setJaEnviado } = useField<boolean>({
    path: 'emailConfirmacaoEnviado',
  })
  const { setValue: setStatusPagamento } = useField<string>({ path: 'statusPagamento' })
  const [loading, setLoading] = useState(false)

  if (!id || metodoPagamento !== 'pix') return null

  async function send() {
    setLoading(true)
    try {
      const response = await fetch(`/api/inscricoes/${id}/enviar-confirmacao`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = (await response.json()) as {
        error?: string
        message?: string
        errors?: { message?: string }[]
      }
      if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || data.error || data.message || 'Falha ao enviar o e-mail.')
      }
      setJaEnviado(true)
      setStatusPagamento('pago')
      toast.success('E-mail de confirmação enviado.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao enviar o e-mail.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <p style={{ margin: 0, fontWeight: 600 }}>E-mail de confirmação</p>
      <p style={{ margin: 0, color: 'var(--theme-elevation-600)', fontSize: 13, lineHeight: 1.45 }}>
        Depois de validar o comprovante Pix, envie o e-mail de inscrição confirmada. O pagamento será marcado
        como pago.
      </p>
      <Button buttonStyle="primary" type="button" disabled={loading} onClick={() => void send()}>
        {loading
          ? 'Enviando...'
          : jaEnviado
            ? 'Reenviar e-mail de confirmação'
            : 'Enviar e-mail de confirmação'}
      </Button>
    </div>
  )
}
