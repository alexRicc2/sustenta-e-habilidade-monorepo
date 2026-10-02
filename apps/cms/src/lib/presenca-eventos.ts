export const PRESENCA_EVENTO_OPTIONS = [
  { label: 'Dia 1 — Manhã', value: 'd1-manha' },
  { label: 'Dia 1 — Tarde', value: 'd1-tarde' },
  { label: 'Dia 2 — Manhã', value: 'd2-manha' },
  { label: 'Dia 2 — Tarde', value: 'd2-tarde' },
] as const

export type PresencaEvento = (typeof PRESENCA_EVENTO_OPTIONS)[number]['value']

export const PRESENCA_EVENTO_VALUES = PRESENCA_EVENTO_OPTIONS.map((option) => option.value)

export function isPresencaEvento(value: unknown): value is PresencaEvento {
  return typeof value === 'string' && (PRESENCA_EVENTO_VALUES as string[]).includes(value)
}

export function labelPresencaEvento(value: string) {
  return PRESENCA_EVENTO_OPTIONS.find((option) => option.value === value)?.label || value
}
