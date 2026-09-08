"use client"

import { useEffect, useRef } from "react"
import { loadStripe, type StripeEmbeddedCheckout } from "@stripe/stripe-js"

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""

export function StripeEmbed({
  clientSecret,
  onComplete,
}: {
  clientSecret: string
  onComplete: () => void
}) {
  const mountRef = useRef<HTMLDivElement>(null)
  const checkoutRef = useRef<StripeEmbeddedCheckout | null>(null)

  useEffect(() => {
    if (!publishableKey || !clientSecret) return
    let cancelled = false

    const start = async () => {
      const stripe = await loadStripe(publishableKey)
      if (!stripe || cancelled) return

      const checkout = await stripe.createEmbeddedCheckoutPage({
        clientSecret,
        onComplete,
      })

      if (cancelled) {
        checkout.destroy()
        return
      }

      checkoutRef.current = checkout
      if (mountRef.current) checkout.mount(mountRef.current)
    }

    void start()

    return () => {
      cancelled = true
      checkoutRef.current?.destroy()
      checkoutRef.current = null
    }
  }, [clientSecret, onComplete])

  if (!publishableKey) {
    return (
      <p className="rounded-2xl bg-white/10 p-4 text-sm text-white/80">
        Configure <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> e <code>STRIPE_SECRET_KEY</code> para
        habilitar o cartão.
      </p>
    )
  }

  return <div ref={mountRef} className="overflow-hidden rounded-2xl bg-white" />
}
