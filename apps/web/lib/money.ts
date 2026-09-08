export const CARD_FEE_RATE = 0.05

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function cardTotalCents(priceCents: number) {
  return Math.round(priceCents * (1 + CARD_FEE_RATE))
}

export function centsToAmount(cents: number) {
  return Number((cents / 100).toFixed(2))
}
