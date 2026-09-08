import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Inscricoes } from './collections/Inscricoes'
import { confirmarPagamentoEndpoint, submitInscricaoEndpoint } from './endpoints/inscricoes'

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
  collections: [Users, Media, Inscricoes],
  endpoints: [submitInscricaoEndpoint, confirmarPagamentoEndpoint],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  email: await nodemailerAdapter({
    defaultFromAddress: env('EMAIL_USER') || 'noreply@localhost',
    defaultFromName: 'II Sustenta & Habilidade',
    skipVerify: true,
    transportOptions: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: env('EMAIL_USER'),
        pass: env('EMAIL_PASS'),
      },
    },
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

