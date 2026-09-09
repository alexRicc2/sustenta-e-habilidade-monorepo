import type { CollectionConfig } from 'payload'
import { downloadQrcodePngEndpoint } from '@/endpoints/qrcodes'

export const Qrcodes: CollectionConfig = {
  slug: 'qrcodes',
  labels: {
    singular: 'QR Code',
    plural: 'QR Codes',
  },
  admin: {
    useAsTitle: 'numero',
    defaultColumns: ['numero', 'status', 'inscricao', 'download', 'codigo'],
    group: 'Evento',
    description:
      'Pool fixo de 150 QR Codes. Baixe um por um na lista, todos em ZIP, ou abra a folha de impressão. O status muda para Atribuído quando a inscrição é confirmada e volta a Disponível se for cancelada.',
    hidden: ({ user }) => !user,
    listSearchableFields: ['numero', 'codigo'],
    pagination: {
      defaultLimit: 150,
      limits: [10, 25, 50, 150],
    },
    components: {
      beforeListTable: ['/components/PrintQrcodes#PrintQrcodes'],
    },
  },
  access: {
    create: () => false,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  defaultSort: 'numero',
  endpoints: [downloadQrcodePngEndpoint],
  fields: [
    {
      name: 'numero',
      type: 'number',
      required: true,
      unique: true,
      index: true,
      label: 'Número',
      admin: {
        readOnly: true,
        description: 'Número impresso no crachá (001 a 150).',
      },
    },
    {
      name: 'codigo',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Código (UUID)',
      admin: {
        readOnly: true,
        description: 'Valor gravado no QR Code. Não altere depois da impressão.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'disponivel',
      index: true,
      label: 'Status',
      options: [
        { label: 'Disponível', value: 'disponivel' },
        { label: 'Atribuído', value: 'atribuido' },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'inscricao',
      type: 'relationship',
      relationTo: 'inscricoes',
      label: 'Inscrição',
      admin: {
        readOnly: true,
        description: 'Inscrição confirmada que está usando este QR Code.',
      },
    },
    {
      name: 'download',
      type: 'ui',
      label: 'Arquivo',
      admin: {
        components: {
          Cell: '/components/DownloadQrcode#DownloadQrcodeCell',
          Field: '/components/DownloadQrcode#DownloadQrcodeField',
        },
      },
    },
  ],
  timestamps: true,
}
