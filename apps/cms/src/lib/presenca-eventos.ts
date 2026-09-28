export const PRESENCA_EVENTO_OPTIONS = [
  { label: 'Dia 1 — Antes do coffee', value: 'd1-antes-coffee' },
  { label: 'Dia 1 — Depois do coffee', value: 'd1-depois-coffee' },
  { label: 'Dia 1 — Depois do almoço', value: 'd1-depois-almoco' },
  { label: 'Dia 1 — Depois do coffee (tarde)', value: 'd1-depois-coffee-tarde' },
  { label: 'Dia 2 — Antes do coffee', value: 'd2-antes-coffee' },
  { label: 'Dia 2 — Depois do coffee', value: 'd2-depois-coffee' },
  { label: 'Dia 2 — Depois do almoço', value: 'd2-depois-almoco' },
  { label: 'Dia 2 — Depois do coffee (tarde)', value: 'd2-depois-coffee-tarde' },
] as const

export type PresencaEvento = (typeof PRESENCA_EVENTO_OPTIONS)[number]['value']

export const PRESENCA_EVENTO_VALUES = PRESENCA_EVENTO_OPTIONS.map((option) => option.value)

export function isPresencaEvento(value: unknown): value is PresencaEvento {
  return typeof value === 'string' && (PRESENCA_EVENTO_VALUES as string[]).includes(value)
}

export function labelPresencaEvento(value: string) {
  return PRESENCA_EVENTO_OPTIONS.find((option) => option.value === value)?.label || value
}
