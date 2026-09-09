import { APIError, type Payload, type PayloadRequest } from 'payload'
import QRCode from 'qrcode'
import type { Inscricoe } from '@/payload-types'
import pool from './qrcode-pool.json'

export const QRCODE_POOL_SIZE = 150
export const QRCODE_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type QrcodePoolItem = {
  numero: number
  codigo: string
}

export type AssignedQrcode = {
  id: string
  codigo: string
  numero: number
  inscricao?: unknown
}

export function formatQrNumero(numero: number) {
  return String(numero).padStart(3, '0')
}

export function relationId(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'id' in value && (value as { id?: unknown }).id) {
    return String((value as { id: string | number }).id)
  }
  return null
}

export function qrcodeFromInscricao(inscricao: Inscricoe): AssignedQrcode | null {
  const qr = (inscricao as Inscricoe & { qrcode?: unknown }).qrcode
  if (qr && typeof qr === 'object' && 'codigo' in qr && 'numero' in qr && 'id' in qr) {
    return {
      id: String((qr as AssignedQrcode).id),
      codigo: String((qr as AssignedQrcode).codigo),
      numero: Number((qr as AssignedQrcode).numero),
    }
  }
  return null
}

export async function qrPngBuffer(codigo: string) {
  return QRCode.toBuffer(codigo, {
    type: 'png',
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'M',
  })
}

export async function qrDataUrl(codigo: string) {
  return QRCode.toDataURL(codigo, {
    width: 420,
    margin: 1,
    errorCorrectionLevel: 'M',
  })
}

let seedInFlight: Promise<number> | null = null

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchAllQrcodes(payload: Payload) {
  const docs: Array<{ id: string; numero: number; codigo: string; status: string; inscricao?: unknown }> = []
  let page = 1
  while (true) {
    const result = await payload.find({
      collection: 'qrcodes',
      limit: 250,
      page,
      depth: 0,
      overrideAccess: true,
    })
    docs.push(...result.docs)
    if (page >= result.totalPages) break
    page += 1
  }
  return docs
}

async function createQrcodeWithRetry(payload: Payload, item: QrcodePoolItem) {
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      await payload.create({
        collection: 'qrcodes',
        data: {
          numero: item.numero,
          codigo: item.codigo,
          status: 'disponivel',
        },
        overrideAccess: true,
      })
      return
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (message.includes('duplicate') || message.includes('E11000')) return
      if (attempt === 9 || (!message.includes('catalog changes') && !message.includes('please retry'))) {
        throw error
      }
      await sleep(400 * (attempt + 1))
    }
  }
}

export async function seedQrcodes(payload: Payload) {
  if (seedInFlight) return seedInFlight
  seedInFlight = (async () => {
    const existing = await fetchAllQrcodes(payload)
    const poolByNumero = new Map((pool as QrcodePoolItem[]).map((item) => [item.numero, item]))
    const keptByNumero = new Map<number, (typeof existing)[number]>()

    for (const doc of existing) {
      const expected = poolByNumero.get(doc.numero)
      if (!expected) continue
      const current = keptByNumero.get(doc.numero)
      if (!current) {
        keptByNumero.set(doc.numero, doc)
        continue
      }
      const docAssigned = doc.status === 'atribuido'
      const currentAssigned = current.status === 'atribuido'
      if (docAssigned && !currentAssigned) {
        keptByNumero.set(doc.numero, doc)
      }
    }

    const hasAssigned = existing.some((doc) => doc.status === 'atribuido')
    const uniqueCount = keptByNumero.size
    const extraCount = existing.length - uniqueCount
    const collection = payload.db.connection.collection('qrcodes')

    if (!hasAssigned && (existing.length !== QRCODE_POOL_SIZE || extraCount > 0)) {
      await collection.deleteMany({})
      keptByNumero.clear()
      if (existing.length > 0) {
        payload.logger.info(`Reset QR code pool (${existing.length} documents removed).`)
      }
    } else if (extraCount > 0) {
      const keepIds = new Set([...keptByNumero.values()].map((doc) => doc.id))
      const extraIds = existing.filter((doc) => !keepIds.has(doc.id)).map((doc) => doc.id)
      for (const id of extraIds) {
        await payload.delete({
          collection: 'qrcodes',
          id,
          overrideAccess: true,
        })
      }
      payload.logger.info(`Removed ${extraIds.length} duplicate QR codes.`)
    }

    let created = 0
    for (const item of pool as QrcodePoolItem[]) {
      if (keptByNumero.has(item.numero)) continue
      await createQrcodeWithRetry(payload, item)
      created += 1
    }

    if (created > 0) {
      payload.logger.info(`Seeded ${created} QR codes (${QRCODE_POOL_SIZE} no pool).`)
    }

    return created
  })().finally(() => {
    seedInFlight = null
  })

  return seedInFlight
}

export async function claimAvailableQrcode(
  payload: Payload,
  inscricaoId: string,
  req?: PayloadRequest,
): Promise<AssignedQrcode> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const found = await payload.find({
      collection: 'qrcodes',
      where: { status: { equals: 'disponivel' } },
      sort: 'numero',
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })
    const available = found.docs[0]
    if (!available) {
      throw new APIError(
        'Não há QR Codes disponíveis. Todos os 150 códigos já foram atribuídos.',
        409,
      )
    }

    await payload.update({
      collection: 'qrcodes',
      id: available.id,
      data: {
        status: 'atribuido',
        inscricao: inscricaoId,
      },
      overrideAccess: true,
      context: { skipQrHooks: true },
      req,
    })

    const claimed = await payload.findByID({
      collection: 'qrcodes',
      id: available.id,
      depth: 0,
      overrideAccess: true,
      req,
    })

    if (relationId(claimed.inscricao) === inscricaoId) {
      return {
        id: claimed.id,
        codigo: claimed.codigo,
        numero: claimed.numero,
      }
    }
  }

  throw new APIError('Não foi possível atribuir um QR Code. Tente novamente.', 409)
}

export async function releaseQrcode(
  payload: Payload,
  qrId: string,
  inscricaoId: string,
  req?: PayloadRequest,
) {
  const qr = await payload.findByID({
    collection: 'qrcodes',
    id: qrId,
    depth: 0,
    overrideAccess: true,
    req,
  })

  const ownerId = relationId(qr.inscricao)
  if (ownerId && ownerId !== inscricaoId) return

  await payload.update({
    collection: 'qrcodes',
    id: qrId,
    data: {
      status: 'disponivel',
      inscricao: null,
    },
    overrideAccess: true,
    context: { skipQrHooks: true },
    req,
  })
}

export async function assignQrToInscricaoData(
  payload: Payload,
  inscricaoId: string,
  currentQr: unknown,
  req?: PayloadRequest,
) {
  const existingId = relationId(currentQr)
  if (existingId) {
    try {
      const existing = await payload.findByID({
        collection: 'qrcodes',
        id: existingId,
        depth: 0,
        overrideAccess: true,
        req,
      })
      const ownerId = relationId(existing.inscricao)
      if (!ownerId || ownerId === inscricaoId) {
        if (existing.status !== 'atribuido' || ownerId !== inscricaoId) {
          await payload.update({
            collection: 'qrcodes',
            id: existingId,
            data: { status: 'atribuido', inscricao: inscricaoId },
            overrideAccess: true,
            context: { skipQrHooks: true },
            req,
          })
        }
        return existingId
      }
    } catch {
      // QR was removed; claim a new one below.
    }
  }

  const claimed = await claimAvailableQrcode(payload, inscricaoId, req)
  return claimed.id
}

export async function getInscricaoWithQr(
  payload: Payload,
  id: string,
  req?: PayloadRequest,
) {
  return payload.findByID({
    collection: 'inscricoes',
    id,
    depth: 1,
    overrideAccess: true,
    req,
  }) as Promise<Inscricoe>
}
