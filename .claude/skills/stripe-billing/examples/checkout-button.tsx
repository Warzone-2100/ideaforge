/**
 * Stripe Checkout Button Component
 *
 * A reusable button that initiates Stripe Checkout for a given price.
 *
 * @example
 * <CheckoutButton priceId="price_xxx" planName="Pro">
 *   Upgrade to Pro
 * </CheckoutButton>
 */

'use client'

import { useState } from 'react'

interface CheckoutButtonProps {
  priceId: string
  planName: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function CheckoutButton({
  priceId,
  planName,
  children,
  className = '',
  disabled = false,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (data.error) {
        console.error('Checkout error:', data.error)
        // Show error toast/notification
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Checkout failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        px-6 py-3 rounded-lg font-medium
        bg-indigo-500 text-white
        hover:bg-indigo-400
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
    >
      {loading ? (
        <>
          <LoadingSpinner />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  )
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
