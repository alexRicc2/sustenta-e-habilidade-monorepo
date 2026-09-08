import type { CollectionConfig } from 'payload'
import { enviarConfirmacaoEndpoint } from '@/endpoints/inscricoes'

export const Inscricoes: CollectionConfig = {
  slug: 'inscricoes',
  labels: {
    singular: 'Inscrição',
    plural: 'Inscrições',
  },
  admin: {
    useAsTitle: 'nomeCompleto',
    defaultColumns: ['nomeCompleto', 'email', 'categoria', 'metodoPagamento', 'statusPagamento', 'createdAt'],
    group: 'Evento',
  },
  endpoints: [enviarConfirmacaoEndpoint],
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
      unique: true,
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
        { label: 'Graduação outras IES', value: 'graduacao-outra' },
        { label: 'Pós-graduação', value: 'pos' },
        { label: 'Docente / profissional', value: 'profissional' },
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
      label: 'Confirmação Pix',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        condition: (data) => data?.metodoPagamento === 'pix',
        components: {
          Field: '/components/SendConfirmationEmail#SendConfirmationEmail',
        },
      },
    },
  ],
  timestamps: true,
}
