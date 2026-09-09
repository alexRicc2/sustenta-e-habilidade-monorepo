import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { enviarConfirmacaoEndpoint } from '@/endpoints/inscricoes'
import { assignQrToInscricaoData, relationId, releaseQrcode } from '@/lib/qrcode'
import type { Inscricoe } from '@/payload-types'

const syncQrcodeOnChange: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
  operation,
  context,
}) => {
  if (context?.skipQrHooks) return data

  const nextStatus = data.statusPagamento ?? originalDoc?.statusPagamento
  const currentQr = data.qrcode !== undefined ? data.qrcode : originalDoc?.qrcode

  if (nextStatus === 'pago' && operation !== 'create' && originalDoc?.id) {
    data.qrcode = await assignQrToInscricaoData(req.payload, String(originalDoc.id), currentQr, req)
  }

  if (nextStatus === 'cancelado') {
    const qrId = relationId(currentQr)
    if (qrId && originalDoc?.id) {
      await releaseQrcode(req.payload, qrId, String(originalDoc.id), req)
    }
    data.qrcode = null
  }

  return data
}

export const Inscricoes: CollectionConfig = {
  slug: 'inscricoes',
  labels: {
    singular: 'Inscrição',
    plural: 'Inscrições',
  },
  admin: {
    useAsTitle: 'nomeCompleto',
    defaultColumns: [
      'nomeCompleto',
      'email',
      'categoria',
      'metodoPagamento',
      'statusPagamento',
      'qrcode',
      'createdAt',
    ],
    group: 'Evento',
  },
  endpoints: [enviarConfirmacaoEndpoint],
  hooks: {
    beforeChange: [syncQrcodeOnChange],
    afterChange: [
      async ({ doc, req, operation, context }) => {
        if (context?.skipQrHooks) return doc
        if (operation === 'create' && doc.statusPagamento === 'pago' && !doc.qrcode) {
          const qrId = await assignQrToInscricaoData(req.payload, doc.id, null, req)
          return req.payload.update({
            collection: 'inscricoes',
            id: doc.id,
            data: { qrcode: qrId },
            overrideAccess: true,
            context: { skipQrHooks: true },
            req,
          })
        }
        return doc
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const doc = (await req.payload.findByID({
          collection: 'inscricoes',
          id: String(id),
          overrideAccess: true,
          req,
        })) as Inscricoe
        const qrId = relationId(doc.qrcode)
        if (qrId) {
          await releaseQrcode(req.payload, qrId, String(id), req)
        }
      },
    ],
  },
  access: {
    create: () => true,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'nomeCompleto',
      type: 'text',
      required: true,
      label: 'Nome completo',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'E-mail',
    },
    {
      name: 'cpf',
      type: 'text',
      required: true,
      index: true,
      label: 'CPF',
    },
    {
      name: 'telefone',
      type: 'text',
      required: true,
      label: 'Telefone',
    },
    {
      name: 'instituicao',
      type: 'text',
      label: 'Instituição',
    },
    {
      name: 'ra',
      type: 'text',
      label: 'RA',
    },
    {
      name: 'isUnesp',
      type: 'checkbox',
      label: 'É da UNESP',
      defaultValue: false,
    },
    {
      name: 'categoria',
      type: 'select',
      required: true,
      label: 'Categoria do ingresso',
      options: [
        { label: 'Graduação UNESP', value: 'graduacao-unesp' },
        { label: 'Pós-graduação', value: 'pos' },
        { label: 'Permanência estudantil', value: 'permanencia-estudantil' },
        { label: 'Público externo', value: 'publico-externo' },
        { label: 'Graduação outras IES (legado)', value: 'graduacao-outra' },
        { label: 'Docente / profissional (legado)', value: 'profissional' },
      ],
    },
    {
      name: 'valorCentavos',
      type: 'number',
      required: true,
      label: 'Valor (centavos)',
      admin: {
        description: 'Valor cobrado em centavos de real.',
      },
    },
    {
      name: 'metodoPagamento',
      type: 'select',
      required: true,
      label: 'Método de pagamento',
      options: [
        { label: 'Pix', value: 'pix' },
        { label: 'Cartão de crédito', value: 'cartao' },
      ],
    },
    {
      name: 'comprovante',
      type: 'upload',
      relationTo: 'media',
      label: 'Comprovante PIX',
      displayPreview: true,
      admin: {
        condition: (_, siblingData) => siblingData?.metodoPagamento === 'pix',
      },
    },
    {
      name: 'comprovantePermanencia',
      type: 'upload',
      relationTo: 'media',
      label: 'Comprovante de permanência estudantil',
      displayPreview: true,
      admin: {
        condition: (_, siblingData) => siblingData?.categoria === 'permanencia-estudantil',
      },
    },
    {
      name: 'stripeSessionId',
      type: 'text',
      index: true,
      label: 'Stripe session ID',
      admin: {
        readOnly: true,
        condition: (_, siblingData) => siblingData?.metodoPagamento === 'cartao',
      },
    },
    {
      name: 'mercadoPagoPaymentId',
      type: 'text',
      index: true,
      label: 'Mercado Pago payment ID',
      admin: {
        readOnly: true,
        condition: (_, siblingData) => siblingData?.metodoPagamento === 'cartao',
      },
    },
    {
      name: 'statusPagamento',
      type: 'select',
      required: true,
      defaultValue: 'pendente',
      label: 'Status do pagamento',
      options: [
        { label: 'Pendente', value: 'pendente' },
        { label: 'Pago', value: 'pago' },
        { label: 'Cancelado', value: 'cancelado' },
      ],
    },
    {
      name: 'qrcode',
      type: 'relationship',
      relationTo: 'qrcodes',
      label: 'QR Code',
      admin: {
        readOnly: true,
        description:
          'Atribuído automaticamente na confirmação. Volta ao pool se a inscrição for cancelada.',
      },
    },
    {
      name: 'emailConfirmacaoEnviado',
      type: 'checkbox',
      defaultValue: false,
      label: 'E-mail de confirmação enviado',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Marcado automaticamente após o e-mail de inscrição confirmada.',
      },
    },
    {
      name: 'enviarEmailConfirmacao',
      type: 'ui',
      label: 'Aprovar inscrição',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        condition: (data) =>
          data?.metodoPagamento === 'pix' || data?.categoria === 'permanencia-estudantil',
        components: {
          Field: '/components/SendConfirmationEmail#SendConfirmationEmail',
        },
      },
    },
  ],
  timestamps: true,
}
