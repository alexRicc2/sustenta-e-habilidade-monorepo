import { APIError, type Endpoint } from 'payload'
import { QRCODE_UUID_REGEX } from '@/lib/qrcode'
import { isPresencaEvento, labelPresencaEvento } from '@/lib/presenca-eventos'
import { findParticipantePagoByQrCodigo } from '@/lib/presenca'

export const registrarPresencaEndpoint: Endpoint = {
  path: '/presencas-checkin',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      throw new APIError('Unauthorized', 401)
    }

    let body: { codigo?: string; evento?: string } = {}
    try {
      body = (await req.json?.()) || {}
    } catch {
      throw new APIError('JSON inválido.', 400)
    }

    const codigo = String(body.codigo || '').trim().toLowerCase()
    const evento = String(body.evento || '').trim()

    if (!QRCODE_UUID_REGEX.test(codigo)) {
      throw new APIError('QR Code inválido.', 400)
    }
    if (!isPresencaEvento(evento)) {
      throw new APIError('Intervalo de presença inválido.', 400)
    }

    const participante = await findParticipantePagoByQrCodigo(req.payload, codigo, req)
    if (!participante) {
      throw new APIError('Participante não cadastrado ou inscrição não paga.', 404)
    }

    const existing = await req.payload.find({
      collection: 'presencas',
      where: {
        and: [{ evento: { equals: evento } }, { qrCodigo: { equals: participante.qrCodigo } }],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })

    if (existing.docs[0]) {
      return Response.json({
        ok: true,
        alreadyRegistered: true,
        message: `Presença de ${participante.nome} já computada em ${labelPresencaEvento(evento)}.`,
        presenca: existing.docs[0],
        participante: {
          id: participante.qrCodigo,
          name: participante.nome,
        },
      })
    }

    const presenca = await req.payload.create({
      collection: 'presencas',
      data: {
        evento,
        nome: participante.nome,
        qrCodigo: participante.qrCodigo,
        inscricao: participante.inscricaoId,
        lidoEm: new Date().toISOString(),
      },
      overrideAccess: true,
      req,
    })

    return Response.json({
      ok: true,
      alreadyRegistered: false,
      message: `Presença de ${participante.nome} computada (${labelPresencaEvento(evento)}).`,
      presenca,
      participante: {
        id: participante.qrCodigo,
        name: participante.nome,
      },
    })
  },
}
