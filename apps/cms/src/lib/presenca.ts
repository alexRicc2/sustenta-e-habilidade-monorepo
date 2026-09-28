import type { Payload, PayloadRequest } from 'payload'
import type { Inscricoe } from '@/payload-types'
import { QRCODE_UUID_REGEX } from '@/lib/qrcode'

export type ParticipantePresenca = {
  qrCodigo: string
  nome: string
  inscricaoId: string
}

export async function findParticipantePagoByQrCodigo(
  payload: Payload,
  codigoRaw: string,
  req?: PayloadRequest,
): Promise<ParticipantePresenca | null> {
  const codigo = String(codigoRaw || '').trim().toLowerCase()
  if (!QRCODE_UUID_REGEX.test(codigo)) {
    return null
  }

  const found = await payload.find({
    collection: 'qrcodes',
    where: {
      and: [{ codigo: { equals: codigo } }, { status: { equals: 'atribuido' } }],
    },
    depth: 1,
    limit: 1,
    overrideAccess: true,
    req,
  })

  const qr = found.docs[0]
  let inscricao = qr?.inscricao

  if (qr && inscricao && typeof inscricao === 'string') {
    inscricao = await payload.findByID({
      collection: 'inscricoes',
      id: inscricao,
      overrideAccess: true,
      req,
    })
  }

  if (!qr || !inscricao || typeof inscricao === 'string') {
    return null
  }

  const participante = inscricao as Inscricoe
  if (participante.statusPagamento !== 'pago') {
    return null
  }

  return {
    qrCodigo: qr.codigo,
    nome: participante.nomeCompleto,
    inscricaoId: String(participante.id),
  }
}
