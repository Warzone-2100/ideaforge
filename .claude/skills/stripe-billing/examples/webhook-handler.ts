/**
 * Stripe Webhook Handler
 *
 * Complete webhook handler for Next.js App Router.
 * Handles all common subscription lifecycle events.
 *
 * @file app/api/webhooks/stripe/route.ts
 */

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Webhook secret from Stripe Dashboard or CLI
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  // Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const error = err as Error
    console.error(`Webhook signature verification failed: ${error.message}`)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      // ============================================
      // CHECKOUT EVENTS
      // ============================================

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // For subscription checkouts
        if (session.mode === 'subscription') {
          await handleSubscriptionCheckout(session)
        }

        // For one-time payment checkouts
        if (session.mode === 'payment') {
          await handleOneTimePayment(session)
        }

        break
      }

      // ============================================
      // SUBSCRIPTION LIFECYCLE EVENTS
      // ============================================

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`Subscription created: ${subscription.id}`)
        // Usually handled by checkout.session.completed
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(subscription)
        break
      }

      case 'customer.subscription.paused': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionPaused(subscription)
        break
      }

      case 'customer.subscription.resumed': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionResumed(subscription)
        break
      }

      // ============================================
      // INVOICE EVENTS
      // ============================================

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`Invoice paid: ${invoice.id}`)
        // Good place to send receipt email
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      case 'invoice.upcoming': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`Upcoming invoice: ${invoice.id}`)
        // Good place to send reminder email
        break
      }

      // ============================================
      // CUSTOMER EVENTS
      // ============================================

      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer
        console.log(`Customer created: ${customer.id}`)
        break
      }

      case 'customer.deleted': {
        const customer = event.data.object as Stripe.Customer
        console.log(`Customer deleted: ${customer.id}`)
        // Clean up database references
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// ============================================
// HANDLER FUNCTIONS
// ============================================

async function handleSubscriptionCheckout(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  // Get full subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0].price.id

  // TODO: Update your database
  // await db.user.update({
  //   where: { stripeCustomerId: customerId },
  //   data: {
  //     subscriptionId: subscriptionId,
  //     subscriptionStatus: subscription.status,
  //     plan: getPlanFromPriceId(priceId),
  //     currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  //   },
  // })

  console.log(`Subscription checkout completed: ${subscriptionId}`)
}

async function handleOneTimePayment(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string
  const paymentIntentId = session.payment_intent as string

  // TODO: Fulfill the order
  // await fulfillOrder(session.metadata)

  console.log(`One-time payment completed: ${paymentIntentId}`)
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0].price.id

  // TODO: Update your database
  // await db.user.update({
  //   where: { subscriptionId: subscription.id },
  //   data: {
  //     subscriptionStatus: subscription.status,
  //     plan: getPlanFromPriceId(priceId),
  //     currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  //   },
  // })

  console.log(`Subscription updated: ${subscription.id} - Status: ${subscription.status}`)
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  // TODO: Update your database
  // await db.user.update({
  //   where: { subscriptionId: subscription.id },
  //   data: {
  //     subscriptionStatus: 'canceled',
  //     plan: 'free',
  //     subscriptionId: null,
  //   },
  // })

  console.log(`Subscription canceled: ${subscription.id}`)
}

async function handleSubscriptionPaused(subscription: Stripe.Subscription) {
  // TODO: Update your database
  // await db.user.update({
  //   where: { subscriptionId: subscription.id },
  //   data: {
  //     subscriptionStatus: 'paused',
  //   },
  // })

  console.log(`Subscription paused: ${subscription.id}`)
}

async function handleSubscriptionResumed(subscription: Stripe.Subscription) {
  // TODO: Update your database
  // await db.user.update({
  //   where: { subscriptionId: subscription.id },
  //   data: {
  //     subscriptionStatus: subscription.status,
  //   },
  // })

  console.log(`Subscription resumed: ${subscription.id}`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  // TODO: Notify the user
  // await sendEmail({
  //   to: invoice.customer_email,
  //   subject: 'Payment Failed',
  //   template: 'payment-failed',
  //   data: { invoiceUrl: invoice.hosted_invoice_url },
  // })

  console.log(`Payment failed for customer: ${customerId}`)
}

// ============================================
// UTILITIES
// ============================================

function getPlanFromPriceId(priceId: string): string {
  // Map your price IDs to plan names
  const priceToPlan: Record<string, string> = {
    [process.env.STRIPE_PRICE_PRO!]: 'pro',
    [process.env.STRIPE_PRICE_TEAM!]: 'team',
  }
  return priceToPlan[priceId] || 'free'
}
