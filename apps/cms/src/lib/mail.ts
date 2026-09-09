import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Payload } from 'payload'
import type { Inscricoe } from '@/payload-types'
import { formatQrNumero, qrcodeFromInscricao, qrPngBuffer } from '@/lib/qrcode'

export type EmailKind = 'aguardando-aprovacao' | 'confirmacao'

const categoriaLabels: Record<Inscricoe['categoria'], string> = {
  'graduacao-unesp': 'Graduação UNESP',
  'graduacao-outra': 'Graduação outras IES',
  pos: 'Pós-graduação',
  profissional: 'Docente / profissional',
  'permanencia-estudantil': 'Permanência estudantil',
  'publico-externo': 'Público externo',
}

function env(name: string) {
  return (process.env[name] || '').trim().replace(/^['"]|['"]$/g, '')
}

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || 'participante'
}

function formatBRL(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function resolveLogoPath() {
  const fromMeta = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets/logo.png')
  const fromCwd = path.join(process.cwd(), 'src/assets/logo.png')
  if (existsSync(fromMeta)) return fromMeta
  if (existsSync(fromCwd)) return fromCwd
  return null
}

async function getLogoAttachment() {
  const localPath = resolveLogoPath()
  if (localPath) {
    return { filename: 'logo.png', path: localPath, cid: 'logo@sustenta' }
  }

  const frontend = env('FRONTEND_URL') || 'http://localhost:3000'
  try {
    const response = await fetch(`${frontend}/logo.png`)
    if (!response.ok) return null
    const content = Buffer.from(await response.arrayBuffer())
    return { filename: 'logo.png', content, cid: 'logo@sustenta' }
  } catch {
    return null
  }
}

function buildEmail(
  kind: EmailKind,
  inscricao: Inscricoe,
  hasLogo: boolean,
  qr?: { numero: number; codigo: string } | null,
) {
  const nome = firstName(inscricao.nomeCompleto)
  const categoria = categoriaLabels[inscricao.categoria] || inscricao.categoria
  const valor = formatBRL(inscricao.valorCentavos)
  const metodo = inscricao.metodoPagamento === 'pix' ? 'Pix' : 'Cartão de crédito'
  const qrNumero = qr ? formatQrNumero(qr.numero) : null

  const isPending = kind === 'aguardando-aprovacao'
  const title = isPending ? 'Recebemos sua inscrição' : 'Inscrição confirmada'
  const subject = isPending
    ? 'Recebemos sua inscrição — II Sustenta & Habilidade'
    : 'Inscrição confirmada — II Sustenta & Habilidade'
  const headline = isPending ? `Obrigado, ${nome}!` : `Inscrição confirmada, ${nome}!`
  const pendingBody =
    inscricao.categoria === 'permanencia-estudantil'
      ? 'Recebemos sua inscrição no <strong>II Sustenta &amp; Habilidade</strong> e o comprovante de permanência estudantil. Nossa equipe vai analisar os documentos e, em breve, a inscrição será validada. Você receberá um novo e-mail quando tudo estiver confirmado.'
      : 'Recebemos o comprovante Pix da sua inscrição no <strong>II Sustenta &amp; Habilidade</strong>. Nossa equipe está analisando o comprovante e, em breve, a inscrição será validada. Você receberá um novo e-mail quando tudo estiver confirmado.'
  const body = isPending
    ? pendingBody
    : 'Sua inscrição no <strong>II Sustenta &amp; Habilidade</strong> está confirmada. Pagamento validado e vaga garantida — esperamos você nos dias <strong>05 e 06 de outubro de 2026</strong>. Guarde o QR Code abaixo e apresente-o na entrada do evento.'

  const logoBlock = hasLogo
    ? `<img src="cid:logo@sustenta" alt="Sustenta &amp; Habilidade" width="180" style="display:block;margin:0 auto;max-width:180px;height:auto;border:0;" />`
    : `<p style="margin:0 0 4px;font-size:22px;font-weight:800;color:#6f8238;">&amp; sustenta</p>
       <p style="margin:0;font-size:22px;font-weight:700;color:#7a93a7;">habilidade</p>`

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#f6faf3;font-family:Nunito,Segoe UI,Arial,sans-serif;color:#15261c;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6faf3;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 30px rgba(18,51,38,0.12);">
            <tr>
              <td style="background:#ffffff;padding:28px 32px 16px;text-align:center;">
                ${logoBlock}
              </td>
            </tr>
            <tr>
              <td style="background:#123326;padding:14px 32px;text-align:center;">
                <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#6eb4d4;font-weight:800;">II Sustenta &amp; Habilidade</p>
                <p style="margin:6px 0 0;font-size:12px;color:#e7f4e2;">05 e 06 de outubro de 2026</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#6f8238;font-weight:800;">${title}</p>
                <h1 style="margin:10px 0 16px;font-size:28px;line-height:1.2;color:#1c4a33;">${headline}</h1>
                <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#15261c;">${body}</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6faf3;border-radius:16px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#6f8238;font-weight:800;">Resumo da inscrição</p>
                      <p style="margin:0 0 6px;font-size:14px;"><strong>Nome:</strong> ${escapeHtml(inscricao.nomeCompleto)}</p>
                      <p style="margin:0 0 6px;font-size:14px;"><strong>Categoria:</strong> ${escapeHtml(categoria)}</p>
                      <p style="margin:0 0 6px;font-size:14px;"><strong>Valor:</strong> ${valor}</p>
                      <p style="margin:0;font-size:14px;"><strong>Pagamento:</strong> ${metodo}</p>
                      ${qrNumero ? `<p style="margin:8px 0 0;font-size:14px;"><strong>QR Code:</strong> ${qrNumero}</p>` : ''}
                    </td>
                  </tr>
                </table>
                ${
                  qr
                    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;">
                  <tr>
                    <td align="center" style="padding:18px 12px;background:#f6faf3;border-radius:16px;">
                      <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#6f8238;font-weight:800;">Seu QR Code de participação</p>
                      <img src="cid:qrcode@sustenta" alt="QR Code ${qrNumero}" width="220" height="220" style="display:block;margin:0 auto;background:#ffffff;border-radius:12px;border:0;" />
                      <p style="margin:12px 0 0;font-size:20px;font-weight:800;color:#1c4a33;">${qrNumero}</p>
                      <p style="margin:8px 0 0;font-size:13px;line-height:1.5;color:#15261c;">Apresente este código na entrada. Ele também corresponde ao crachá impresso ${qrNumero}.</p>
                    </td>
                  </tr>
                </table>`
                    : ''
                }
                <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#15261c;">
                  Auditório A, UNESP/IBILCE — São José do Rio Preto/SP<br />
                  Rua Cristóvão Colombo, 2265, Jardim Nazareth
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#1c4a33;padding:18px 32px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#e7f4e2;">Ações e inovações em Química na busca dos ODS</p>
                <p style="margin:6px 0 0;font-size:11px;color:#6eb4d4;">GIQAV &amp; PET QA · DQCA/UNESP</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim()

  const pendingText =
    inscricao.categoria === 'permanencia-estudantil'
      ? `Obrigado, ${nome}!\n\nRecebemos sua inscrição no II Sustenta & Habilidade e o comprovante de permanência estudantil. Nossa equipe vai analisar os documentos e, em breve, a inscrição será validada.`
      : `Obrigado, ${nome}!\n\nRecebemos o comprovante Pix da sua inscrição no II Sustenta & Habilidade. Nossa equipe está analisando o comprovante e, em breve, a inscrição será validada.`
  const text = isPending
    ? `${pendingText}\n\nCategoria: ${categoria}\nValor: ${valor}\n\n05 e 06 de outubro de 2026 · UNESP/IBILCE`
    : `Inscrição confirmada, ${nome}!\n\nSua inscrição no II Sustenta & Habilidade está confirmada. Pagamento validado e vaga garantida.\n\nCategoria: ${categoria}\nValor: ${valor}${qrNumero ? `\nQR Code: ${qrNumero}` : ''}\n\nApresente o QR Code deste e-mail na entrada do evento.\n\n05 e 06 de outubro de 2026 · UNESP/IBILCE`

  return { subject, html, text }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function sendInscricaoEmail(payload: Payload, inscricao: Inscricoe, kind: EmailKind) {
  const logo = await getLogoAttachment()
  const qr = kind === 'confirmacao' ? qrcodeFromInscricao(inscricao) : null
  const { subject, html, text } = buildEmail(kind, inscricao, Boolean(logo), qr)
  const attachments: Array<{ filename: string; cid: string; path?: string; content?: Buffer }> = logo
    ? [logo]
    : []

  if (qr) {
    const content = await qrPngBuffer(qr.codigo)
    attachments.push({
      filename: `qrcode-${formatQrNumero(qr.numero)}.png`,
      content,
      cid: 'qrcode@sustenta',
    })
  }

  await payload.sendEmail({
    to: inscricao.email,
    subject,
    text,
    html,
    attachments,
  })
}

export async function sendInscricaoEmailSafe(payload: Payload, inscricao: Inscricoe, kind: EmailKind) {
  try {
    await sendInscricaoEmail(payload, inscricao, kind)
    return true
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Falha ao enviar e-mail de inscrição' })
    return false
  }
}
