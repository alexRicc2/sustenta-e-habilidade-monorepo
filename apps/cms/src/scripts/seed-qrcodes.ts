import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { seedQrcodes } from '../lib/qrcode'

const payload = await getPayload({ config })
const created = await seedQrcodes(payload)
const total = await payload.count({ collection: 'qrcodes', overrideAccess: true })
console.log(`Created ${created} QR codes. Total in pool: ${total.totalDocs}`)
process.exit(0)
