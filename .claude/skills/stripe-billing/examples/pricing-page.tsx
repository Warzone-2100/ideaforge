/**
 * Stripe Pricing Page Example
 *
 * A complete pricing page with multiple tiers and checkout integration.
 *
 * @example
 * // app/pricing/page.tsx
 * export default function PricingPage() {
 *   return <Pricing />
 * }
 */

'use client'

import { Check } from 'lucide-react'
import { CheckoutButton } from './checkout-button'

// Define your plans - move to config/stripe.ts in real app
const PLANS = [
  {
    name: 'Free',
    price: 0,
    priceId: null,
    description: 'For individuals getting started',
    features: [
      '5 projects',
      'Basic analytics',
      'Community support',
      '1GB storage',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: 19,
    priceId: 'price_xxxxxxxxxxxxx', // Replace with your price ID
    description: 'For professionals and small teams',
    features: [
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      '10GB storage',
      'API access',
      'Custom integrations',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Team',
    price: 49,
    priceId: 'price_yyyyyyyyyyyyy', // Replace with your price ID
    description: 'For growing teams and businesses',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Admin dashboard',
      '100GB storage',
      'SSO authentication',
      'Dedicated support',
      'Custom contracts',
    ],
    cta: 'Start Team Trial',
    popular: false,
  },
]

export function Pricing() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-100 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Choose the plan that's right for you. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`
                relative rounded-2xl p-8
                ${plan.popular
                  ? 'bg-indigo-500/10 border-2 border-indigo-500/50'
                  : 'bg-zinc-900/50 border border-zinc-800/50'
                }
              `}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-zinc-500">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-zinc-100">
                  ${plan.price}
                </span>
                <span className="text-zinc-500">/month</span>
              </div>

              {/* CTA Button */}
              {plan.priceId ? (
                <CheckoutButton
                  priceId={plan.priceId}
                  planName={plan.name}
                  className={`w-full mb-6 ${
                    plan.popular
                      ? 'bg-indigo-500 hover:bg-indigo-400'
                      : 'bg-zinc-800 hover:bg-zinc-700'
                  }`}
                >
                  {plan.cta}
                </CheckoutButton>
              ) : (
                <button
                  className="w-full mb-6 px-6 py-3 rounded-lg font-medium
                           bg-zinc-800 text-zinc-300 hover:bg-zinc-700
                           transition-colors"
                >
                  {plan.cta}
                </button>
              )}

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ or additional info */}
        <div className="mt-16 text-center">
          <p className="text-zinc-500">
            All plans include 14-day free trial. No credit card required to start.
          </p>
          <p className="text-zinc-600 mt-2">
            Need a custom plan?{' '}
            <a href="/contact" className="text-indigo-400 hover:text-indigo-300">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
