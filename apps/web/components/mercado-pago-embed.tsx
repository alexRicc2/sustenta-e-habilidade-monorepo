"use client"

import { useEffect } from "react"
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react"

const publicKey =
  process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || process.env.MERCADO_PAGO_PUBLIC_KEY || ""

let sdkReady = false

export type MercadoPagoCardFormData = {
  token: string
  issuer_id: string
  payment_method_id: string
  transaction_amount: number
  installments: number
  payer?: {
    email?: string
    identification?: { type: string; number: string }
  }
}

export function MercadoPagoEmbed({
  amount,
  email,
  cpf,
  onSubmitPayment,
  onError,
}: {
  amount: number
  email: string
  cpf: string
  onSubmitPayment: (formData: MercadoPagoCardFormData) => Promise<void>
  onError: (message: string) => void
}) {
  useEffect(() => {
    if (!publicKey || sdkReady) return
    initMercadoPago(publicKey, { locale: "pt-BR" })
    sdkReady = true
  }, [])

  if (!publicKey) {
    return (
      <p className="rounded-2xl bg-white/10 p-4 text-sm text-white/80">
        Configure <code>NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY</code> e{" "}
        <code>MERCADO_PAGO_ACCESS_TOKEN</code> para habilitar o cartão.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white p-3 text-forest">
      {publicKey.startsWith("TEST-") ? (
        <p className="mb-3 rounded-xl bg-mint px-3 py-2 text-xs leading-5 text-forest">
          Sandbox Mercado Pago: Cartão: 5480 8328 0103 3311, CVV: 123, validade: 11/30, no titular use o nome <strong>APRO</strong> e o CPF{" "}
          <strong>123.456.789-09</strong> para aprovar o pagamento de teste.
        </p>
      ) : null}
      <CardPayment
        locale="pt-BR"
        initialization={{
          amount,
          payer: {
            email,
            identification: { type: "CPF", number: cpf },
          },
        }}
        customization={{
          paymentMethods: {
            maxInstallments: 12,
            types: { excluded: ["debit_card", "prepaid_card"] },
          },
        }}
        onSubmit={onSubmitPayment}
        onError={(error) => onError(error.message || "Não foi possível carregar o pagamento.")}
      />
    </div>
  )
}
