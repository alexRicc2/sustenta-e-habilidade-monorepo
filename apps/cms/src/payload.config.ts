import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import nodemailer from 'nodemailer'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Inscricoes } from './collections/Inscricoes'
import { Qrcodes } from './collections/Qrcodes'
import { confirmarPagamentoEndpoint, submitInscricaoEndpoint } from './endpoints/inscricoes'
import {
  downloadAllQrcodesEndpoint,
  folhaImpressaoEndpoint,
  lookupParticipanteEndpoint,
  seedQrcodesEndpoint,
} from './endpoints/qrcodes'
import { assignQrToInscricaoData, seedQrcodes } from './lib/qrcode'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

function env(name: string) {
  return (process.env[name] || '').trim().replace(/^['"]|['"]$/g, '')
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    dateFormat: 'dd/MM/yyyy, HH:mm',
    timezones: {
      defaultTimezone: 'America/Sao_Paulo',
    },
    meta: {
      titleSuffix: ' — Sustenta & Habilidade',
      icons: {
        icon: '/giqav-logo.jpeg',
        shortcut: '/giqav-logo.jpeg',
      },
    },
    components: {
      graphics: {
        Logo: '/graphics/Logo#Logo',
        Icon: '/graphics/Icon#Icon',
      },
    },
  },
  collections: [Users, Media, Inscricoes, Qrcodes],
  endpoints: [
    submitInscricaoEndpoint,
    confirmarPagamentoEndpoint,
    lookupParticipanteEndpoint,
    folhaImpressaoEndpoint,
    seedQrcodesEndpoint,
    downloadAllQrcodesEndpoint,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  email: await nodemailerAdapter({
    defaultFromAddress: env('EMAIL_USER') || 'noreply@localhost',
    defaultFromName: 'II Sustenta & Habilidade',
    skipVerify: true,
    transport: nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: env('EMAIL_USER'),
        pass: env('EMAIL_PASS'),
      },
    }),
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  cors: [process.env.FRONTEND_URL || 'http://localhost:3000'],
  csrf: [process.env.FRONTEND_URL || 'http://localhost:3000'],
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  onInit: async (payload) => {
    try {
      const indexes = await payload.db.connection.collection('inscricoes').indexes()
      for (const index of indexes) {
        if (index.key?.cpf === 1 && index.unique && index.name) {
          await payload.db.connection.collection('inscricoes').dropIndex(index.name)
          payload.logger.info(`Removed unique index ${index.name} on inscricoes.cpf`)
        }
      }
    } catch (error) {
      payload.logger.warn(
        `Could not inspect inscricoes indexes: ${error instanceof Error ? error.message : error}`,
      )
    }

    try {
      await seedQrcodes(payload)
      const pagosSemQr = await payload.find({
        collection: 'inscricoes',
        where: {
          and: [
            { statusPagamento: { equals: 'pago' } },
            {
              or: [{ qrcode: { exists: false } }, { qrcode: { equals: null } }],
            },
          ],
        },
        limit: 150,
        overrideAccess: true,
      })
      for (const inscricao of pagosSemQr.docs) {
        const qrId = await assignQrToInscricaoData(payload, inscricao.id, inscricao.qrcode)
        await payload.update({
          collection: 'inscricoes',
          id: inscricao.id,
          data: { qrcode: qrId },
          overrideAccess: true,
          context: { skipQrHooks: true },
        })
      }
      if (pagosSemQr.docs.length > 0) {
        payload.logger.info(`Assigned QR codes to ${pagosSemQr.docs.length} paid inscriptions.`)
      }
    } catch (error) {
      payload.logger.warn(
        `Could not seed or assign QR codes: ${error instanceof Error ? error.message : error}`,
      )
    }
  },
  sharp,
  plugins: [
    s3Storage({
      enabled: Boolean(process.env.R2_BUCKET),
      collections: {
        media: {
          prefix: 'media',
        },
      },
      bucket: process.env.R2_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT,
        forcePathStyle: true,
      },
    }),
  ],
})

