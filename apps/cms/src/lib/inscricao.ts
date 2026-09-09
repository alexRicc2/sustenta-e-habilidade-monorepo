import type { Inscricoe } from '@/payload-types'

export function needsManualApproval(
  categoria: Inscricoe['categoria'] | string,
  metodoPagamento: Inscricoe['metodoPagamento'] | string,
) {
  return metodoPagamento === 'pix' || categoria === 'permanencia-estudantil'
}
