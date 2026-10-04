import { addDataAndFileToRequest, APIError, type Endpoint, type PayloadRequest } from 'payload'
import type { Inscricoe } from '@/payload-types'
import { needsManualApproval } from '@/lib/inscricao'
import { getInscricaoWithQr } from '@/lib/qrcode'
import { sendInscricaoEmail, sendInscricaoEmailSafe } from '@/lib/mail'

export type InscricaoInput = {
  nomeCompleto: string
  email: string
  cpf: string
  telefone: string
  instituicao?: string
  ra?: string
  isUnesp?: boolean | string
  preferenciaAlimentar: Inscricoe['preferenciaAlimentar']
  categoria: Inscricoe['categoria']
  metodoPagamento: Inscricoe['metodoPagamento']
  valorCentavos: number
  comprovanteId?: string
  comprovantePermanenciaId?: string
  stripeSessionId?: string
  mercadoPagoPaymentId?: string
}

async function readJsonBody(req: PayloadRequest) {
  if (!req.data) {
    await addDataAndFileToRequest(req)
  }
  return (req.data || {}) as InscricaoInput
}

export const submitInscricaoEndpoint: Endpoint = {
  path: '/submit-inscricao',
  method: 'post',
  handler: async () => {
    throw new APIError('As inscrições estão encerradas.', 403)
  },
}

export const confirmarPagamentoEndpoint: Endpoint = {
  path: '/confirmar-pagamento',
  method: 'post',
  handler: async (req) => {
    const secret = req.headers.get('x-internal-secret')
    if (!secret || secret !== process.env.INTERNAL_SECRET) {
      throw new APIError('Unauthorized', 401)
    }

    const body = await readJsonBody(req)
    if (!body.mercadoPagoPaymentId && !body.stripeSessionId) {
      throw new APIError('ID de pagamento é obrigatório', 400)
    }

    const found = await req.payload.find({
      collection: 'inscricoes',
      where: body.mercadoPagoPaymentId
        ? { mercadoPagoPaymentId: { equals: body.mercadoPagoPaymentId } }
        : { stripeSessionId: { equals: body.stripeSessionId } },
      limit: 1,
      overrideAccess: true,
    })

    if (!found.docs[0]) throw new APIError('Inscrição não encontrada', 404)

    const existing = found.docs[0] as Inscricoe

    if (needsManualApproval(existing.categoria, existing.metodoPagamento)) {
      return Response.json({ ok: true, doc: existing, awaitingApproval: true })
    }

    await req.payload.update({
      collection: 'inscricoes',
      id: existing.id,
      data: { statusPagamento: 'pago' },
      overrideAccess: true,
    })

    const shouldSendCardEmail =
      existing.metodoPagamento === 'cartao' && !existing.emailConfirmacaoEnviado
    const withQr = await getInscricaoWithQr(req.payload, existing.id, req)

    let sent = false
    if (shouldSendCardEmail) {
      sent = await sendInscricaoEmailSafe(req.payload, withQr, 'confirmacao')
    }

    if (sent) {
      await req.payload.update({
        collection: 'inscricoes',
        id: existing.id,
        data: { emailConfirmacaoEnviado: true },
        overrideAccess: true,
        context: { skipQrHooks: true },
      })
    }

    return Response.json({ ok: true, doc: withQr })
  },
}

export const enviarConfirmacaoEndpoint: Endpoint = {
  path: '/:id/enviar-confirmacao',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      throw new APIError('Unauthorized', 401)
    }

    const id = String(req.routeParams?.id || '')
    if (!id) throw new APIError('ID da inscrição é obrigatório', 400)

    const inscricao = (await req.payload.findByID({
      collection: 'inscricoes',
      id,
      overrideAccess: true,
    })) as Inscricoe

    if (!needsManualApproval(inscricao.categoria, inscricao.metodoPagamento)) {
      throw new APIError(
        'A aprovação manual é apenas para Pix ou permanência estudantil.',
        400,
      )
    }

    await req.payload.update({
      collection: 'inscricoes',
      id,
      data: { statusPagamento: 'pago' },
      overrideAccess: true,
    })

    const withQr = await getInscricaoWithQr(req.payload, id, req)
    await sendInscricaoEmail(req.payload, withQr, 'confirmacao')

    await req.payload.update({
      collection: 'inscricoes',
      id,
      data: { emailConfirmacaoEnviado: true },
      overrideAccess: true,
      context: { skipQrHooks: true },
    })

    return Response.json({ ok: true, doc: withQr })
  },
}
