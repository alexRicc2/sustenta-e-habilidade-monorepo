import { APIError, type Endpoint } from 'payload'
import JSZip from 'jszip'
import type { Inscricoe } from '@/payload-types'
import {
  formatQrNumero,
  QRCODE_POOL_SIZE,
  QRCODE_UUID_REGEX,
  qrDataUrl,
  qrPngBuffer,
  seedQrcodes,
} from '@/lib/qrcode'

export const lookupParticipanteEndpoint: Endpoint = {
  path: '/qr-participante/:codigo',
  method: 'get',
  handler: async (req) => {
    const codigo = String(req.routeParams?.codigo || '').trim().toLowerCase()
    if (!QRCODE_UUID_REGEX.test(codigo)) {
      throw new APIError('QR Code inválido.', 400)
    }

    const found = await req.payload.find({
      collection: 'qrcodes',
      where: {
        and: [{ codigo: { equals: codigo } }, { status: { equals: 'atribuido' } }],
      },
      depth: 1,
      limit: 1,
      overrideAccess: true,
    })

    const qr = found.docs[0]
    let inscricao = qr?.inscricao

    if (qr && inscricao && typeof inscricao === 'string') {
      inscricao = await req.payload.findByID({
        collection: 'inscricoes',
        id: inscricao,
        overrideAccess: true,
      })
    }

    if (!qr || !inscricao || typeof inscricao === 'string') {
      throw new APIError('Participante não cadastrado.', 404)
    }

    const participante = inscricao as Inscricoe
    if (participante.statusPagamento !== 'pago') {
      throw new APIError('Participante não cadastrado.', 404)
    }

    return Response.json({
      ok: true,
      participante: {
        id: qr.codigo,
        name: participante.nomeCompleto,
      },
    })
  },
}

export const folhaImpressaoEndpoint: Endpoint = {
  path: '/qrcodes-folha-impressao',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      throw new APIError('Unauthorized', 401)
    }

    const found = await req.payload.find({
      collection: 'qrcodes',
      sort: 'numero',
      limit: QRCODE_POOL_SIZE,
      depth: 0,
      overrideAccess: true,
    })

    const cards = await Promise.all(
      found.docs.map(async (qr) => {
        const dataUrl = await qrDataUrl(qr.codigo)
        return {
          numero: formatQrNumero(qr.numero),
          codigo: qr.codigo,
          dataUrl,
          status: qr.status,
        }
      }),
    )

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>QR Codes — II Sustenta &amp; Habilidade</title>
    <style>
      @page { size: A4; margin: 10mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 16px;
        font-family: Nunito, Segoe UI, Arial, sans-serif;
        background: #f6faf3;
        color: #15261c;
      }
      h1 { margin: 0 0 4px; font-size: 22px; color: #1c4a33; }
      .meta { margin: 0 0 18px; color: #4f6f62; font-size: 13px; }
      .actions { margin-bottom: 18px; }
      button {
        background: #123326;
        color: #fff;
        border: 0;
        border-radius: 8px;
        padding: 8px 14px;
        font-size: 14px;
        cursor: pointer;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      .card {
        background: #fff;
        border: 1px dashed #9bb59a;
        border-radius: 12px;
        padding: 12px 10px 10px;
        text-align: center;
        break-inside: avoid;
      }
      .card img {
        width: 100%;
        max-width: 180px;
        background: #fff;
      }
      .numero {
        margin: 8px 0 2px;
        font-size: 20px;
        font-weight: 800;
        letter-spacing: 0.04em;
        color: #123326;
      }
      .label { font-size: 11px; color: #6f8238; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; }
      .codigo { font-size: 9px; color: #7a93a7; word-break: break-all; margin-top: 4px; }
      @media print {
        body { background: #fff; padding: 0; }
        .actions { display: none; }
      }
    </style>
  </head>
  <body>
    <h1>II Sustenta &amp; Habilidade</h1>
    <p class="meta">${cards.length} QR Codes para impressão · 05 e 06 de outubro de 2026</p>
    <div class="actions"><button onclick="window.print()">Imprimir</button></div>
    <div class="grid">
      ${cards
        .map(
          (card) => `<article class="card">
        <div class="label">QR Code</div>
        <img src="${card.dataUrl}" alt="QR ${card.numero}" />
        <div class="numero">${card.numero}</div>
        <div class="codigo">${card.codigo}</div>
      </article>`,
        )
        .join('\n      ')}
    </div>
  </body>
</html>`

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  },
}

export const seedQrcodesEndpoint: Endpoint = {
  path: '/qrcodes-seed',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      throw new APIError('Unauthorized', 401)
    }

    const created = await seedQrcodes(req.payload)
    const total = await req.payload.count({
      collection: 'qrcodes',
      overrideAccess: true,
    })

    return Response.json({
      ok: true,
      created,
      total: total.totalDocs,
    })
  },
}

export const downloadAllQrcodesEndpoint: Endpoint = {
  path: '/qrcodes-download-zip',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      throw new APIError('Unauthorized', 401)
    }

    const found = await req.payload.find({
      collection: 'qrcodes',
      sort: 'numero',
      limit: QRCODE_POOL_SIZE,
      depth: 0,
      overrideAccess: true,
    })

    if (found.docs.length === 0) {
      throw new APIError('Nenhum QR Code gerado ainda.', 404)
    }

    const zip = new JSZip()
    for (const qr of found.docs) {
      const png = await qrPngBuffer(qr.codigo)
      zip.file(`qrcode-${formatQrNumero(qr.numero)}.png`, png)
    }

    const content = await zip.generateAsync({ type: 'uint8array' })
    return new Response(content, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="qrcodes-sustenta-habilidade.zip"',
      },
    })
  },
}

export const downloadQrcodePngEndpoint: Endpoint = {
  path: '/:id/png',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      throw new APIError('Unauthorized', 401)
    }

    const id = String(req.routeParams?.id || '')
    if (!id) throw new APIError('ID do QR Code é obrigatório', 400)

    const qr = await req.payload.findByID({
      collection: 'qrcodes',
      id,
      overrideAccess: true,
    })

    const png = await qrPngBuffer(qr.codigo)
    const filename = `qrcode-${formatQrNumero(qr.numero)}.png`
    const asDownload = new URL(req.url || '', 'http://localhost').searchParams.get('download') === '1'

    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `${asDownload ? 'attachment' : 'inline'}; filename="${filename}"`,
        'Cache-Control': 'private, max-age=86400',
      },
    })
  },
}
