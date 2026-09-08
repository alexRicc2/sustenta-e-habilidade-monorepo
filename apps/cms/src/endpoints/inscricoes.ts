import { addDataAndFileToRequest, APIError, type Endpoint, type Payload, type PayloadRequest } from 'payload'
import type { Inscricoe } from '@/payload-types'
import { sendInscricaoEmail, sendInscricaoEmailSafe } from '@/lib/mail'

export type InscricaoInput = {
  nomeCompleto: string
  email: string
  cpf: string
  telefone: string
  instituicao?: string
  ra?: string
  isUnesp?: boolean | string
  categoria: Inscricoe['categoria']
  metodoPagamento: Inscricoe['metodoPagamento']
  valorCentavos: number
  comprovanteId?: string
  stripeSessionId?: string
  mercadoPagoPaymentId?: string
}

async function readJsonBody(req: PayloadRequest) {
  if (!req.data) {
    await addDataAndFileToRequest(req)
  }
  return (req.data || {}) as InscricaoInput
}

async function upsertInscricao(payload: Payload, data: InscricaoInput) {
  const existing = await payload.find({
    collection: 'inscricoes',
    where: { cpf: { equals: data.cpf } },
    limit: 1,
    overrideAccess: true,
  })

  const docData = {
    nomeCompleto: data.nomeCompleto,
    email: data.email,
    cpf: data.cpf,
    telefone: data.telefone,
    instituicao: data.instituicao || '',
    ra: data.ra || '',
    isUnesp: data.isUnesp === true || data.isUnesp === 'true',
    categoria: data.categoria,
    metodoPagamento: data.metodoPagamento,
    valorCentavos: Number(data.valorCentavos),
    statusPagamento: 'pendente' as const,
    ...(data.comprovanteId ? { comprovante: data.comprovanteId } : {}),
    ...(data.stripeSessionId ? { stripeSessionId: data.stripeSessionId } : {}),
    ...(data.mercadoPagoPaymentId ? { mercadoPagoPaymentId: data.mercadoPagoPaymentId } : {}),
  }

  if (existing.docs[0]) {
    return payload.update({
      collection: 'inscricoes',
      id: existing.docs[0].id,
      data: docData,
      overrideAccess: true,
    })
  }

  return payload.create({
    collection: 'inscricoes',
    data: docData,
    overrideAccess: true,
  })
}

export const submitInscricaoEndpoint: Endpoint = {
  path: '/submit-inscricao',
  method: 'post',
  handler: async (req) => {
    const data = await readJsonBody(req)
    const required: (keyof InscricaoInput)[] = [
      'nomeCompleto',
      'email',
      'cpf',
      'telefone',
      'categoria',
      'metodoPagamento',
      'valorCentavos',
    ]
    for (const field of required) {
      if (data[field] === undefined || data[field] === '') {
        throw new APIError(`Campo obrigatório: ${field}`, 400)
      }
    }

    const comprovanteId =
      data.comprovanteId || (data as InscricaoInput & { comprovante?: string }).comprovante

    if (data.metodoPagamento === 'pix' && !comprovanteId) {
      throw new APIError('Anexe o comprovante de pagamento PIX.', 400)
    }

    const doc = (await upsertInscricao(req.payload, { ...data, comprovanteId })) as Inscricoe

    if (data.metodoPagamento === 'pix') {
      await sendInscricaoEmailSafe(req.payload, doc, 'pix-recebido')
    } else if (data.mercadoPagoPaymentId) {
      const sent = await sendInscricaoEmailSafe(req.payload, doc, 'confirmacao')
      if (sent) {
        await req.payload.update({
          collection: 'inscricoes',
          id: doc.id,
          data: { emailConfirmacaoEnviado: true },
          overrideAccess: true,
        })
      }
    }

    return Response.json({ ok: true, doc })
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
    const shouldSendCardEmail =
      existing.metodoPagamento === 'cartao' && !existing.emailConfirmacaoEnviado

    let sent = false
    if (shouldSendCardEmail) {
      sent = await sendInscricaoEmailSafe(req.payload, existing, 'confirmacao')
    }

    const doc = await req.payload.update({
      collection: 'inscricoes',
      id: existing.id,
      data: {
        statusPagamento: 'pago',
        ...(sent ? { emailConfirmacaoEnviado: true } : {}),
      },
      overrideAccess: true,
    })

    return Response.json({ ok: true, doc })
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

    if (inscricao.metodoPagamento !== 'pix') {
      throw new APIError('O e-mail de confirmação manual é apenas para pagamentos Pix.', 400)
    }

    await sendInscricaoEmail(req.payload, inscricao, 'confirmacao')

    const doc = await req.payload.update({
      collection: 'inscricoes',
      id,
      data: {
        statusPagamento: 'pago',
        emailConfirmacaoEnviado: true,
      },
      overrideAccess: true,
    })

    return Response.json({ ok: true, doc })
  },
}
