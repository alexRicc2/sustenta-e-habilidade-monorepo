import type { CollectionConfig } from 'payload'
import { PRESENCA_EVENTO_OPTIONS } from '@/lib/presenca-eventos'

export const Presencas: CollectionConfig = {
  slug: 'presencas',
  labels: {
    singular: 'Presença',
    plural: 'Presenças',
  },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'evento', 'qrCodigo', 'lidoEm', 'updatedAt'],
    group: 'Evento',
    description:
      'Presenças lidas por intervalo do dia (antes/depois do coffee e depois do almoço). Use Ler QR Code para registrar.',
    listSearchableFields: ['nome', 'qrCodigo'],
    components: {
      beforeListTable: ['/components/PresencasListHeader#PresencasListHeader'],
    },
  },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  defaultSort: '-lidoEm',
  timestamps: true,
  indexes: [
    {
      fields: ['evento', 'qrCodigo'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'evento',
      type: 'select',
      required: true,
      index: true,
      label: 'Intervalo',
      options: [...PRESENCA_EVENTO_OPTIONS],
      admin: {
        description: 'Momento do dia em que a pessoa retornou ao evento.',
      },
    },
    {
      name: 'nome',
      type: 'text',
      required: true,
      index: true,
      label: 'Nome',
    },
    {
      name: 'qrCodigo',
      type: 'text',
      required: true,
      index: true,
      label: 'Código do QR',
      admin: {
        description: 'UUID impresso no crachá.',
      },
    },
    {
      name: 'inscricao',
      type: 'relationship',
      relationTo: 'inscricoes',
      label: 'Inscrição',
      admin: {
        description: 'Inscrição paga vinculada a este QR Code.',
      },
    },
    {
      name: 'lidoEm',
      type: 'date',
      required: true,
      index: true,
      label: 'Lido em',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd/MM/yyyy HH:mm',
        },
      },
    },
    {
      name: 'observacao',
      type: 'textarea',
      label: 'Observação',
      admin: {
        description: 'Notas manuais (ajuste, justificativa, etc.).',
      },
    },
  ],
}
