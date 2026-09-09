'use client'

import { Button, toast, useDocumentInfo, useField } from '@payloadcms/ui'
import { useState } from 'react'

export function SendConfirmationEmail() {
  const { id } = useDocumentInfo()
  const { value: metodoPagamento } = useField<string>({ path: 'metodoPagamento' })
  const { value: categoria } = useField<string>({ path: 'categoria' })
  const { value: jaEnviado, setValue: setJaEnviado } = useField<boolean>({
    path: 'emailConfirmacaoEnviado',
  })
  const { setValue: setStatusPagamento } = useField<string>({ path: 'statusPagamento' })
  const [loading, setLoading] = useState(false)

  const needsApproval = metodoPagamento === 'pix' || categoria === 'permanencia-estudantil'
  if (!id || !needsApproval) return null

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
      toast.success('Inscrição aprovada. QR Code atribuído e e-mail enviado.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao enviar o e-mail.')
    } finally {
      setLoading(false)
    }
  }

  const isPermanencia = categoria === 'permanencia-estudantil'

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <p style={{ margin: 0, fontWeight: 600 }}>Aprovar inscrição</p>
      <p style={{ margin: 0, color: 'var(--theme-elevation-600)', fontSize: 13, lineHeight: 1.45 }}>
        {isPermanencia
          ? 'Depois de validar o comprovante de permanência estudantil (e o pagamento, se for Pix), aprove a inscrição. O status passará para pago, um QR Code será atribuído e o participante receberá o e-mail de confirmação com o código.'
          : 'Depois de validar o comprovante Pix, aprove a inscrição. O pagamento será marcado como pago, um QR Code será atribuído e o participante receberá o e-mail de confirmação com o código.'}
      </p>
      <Button buttonStyle="primary" type="button" disabled={loading} onClick={() => void send()}>
        {loading
          ? 'Enviando...'
          : jaEnviado
            ? 'Reenviar e-mail de confirmação'
            : 'Aprovar inscrição'}
      </Button>
    </div>
  )
}
