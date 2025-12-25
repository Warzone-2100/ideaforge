# Skill: Stripe Billing

<!--
METADATA - Keep this section under 100 tokens for quick loading
-->
---
name: "stripe-billing"
version: "1.0.0"
description: "Complete Stripe integration for SaaS billing: checkout, subscriptions, webhooks, customer portal"
category: "payments"
complexity: "intermediate"
time_estimate: "2-4 hours"
requires_mcp: ["context7", "stripe"]
requires_skills: ["nextjs-app-router"]
---

## When to Use This Skill

Use this skill when you need to:
- Accept one-time payments or subscriptions
- Manage recurring billing for a SaaS product
- Implement customer self-service portal
- Handle payment webhooks securely

**Do NOT use this skill if:**
- You only need donations → Use Stripe Payment Links instead
- You're selling physical products → Consider Shopify or similar
- You need complex invoicing → Look into Stripe Invoicing specifically

---

## Quick Start (Minimum Viable Implementation)

The fastest path to accepting payments:

### 1. Install Dependencies
```bash
npm install stripe @stripe/stripe-js
```

### 2. Environment Variables
```env
# Add to .env.local
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Your app URL for redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Create Stripe Client (lib/stripe.ts)
```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia', // Use latest API version
  typescript: true,
})
```

### 4. Checkout API Route (app/api/checkout/route.ts)
```typescript
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const { priceId, userId } = await req.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription', // or 'payment' for one-time
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId }, // Link to your user
  })

  return NextResponse.json({ url: session.url })
}
```

### 5. Verify It Works
```bash
# Start your dev server
npm run dev

# In another terminal, forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Full Implementation

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR APP                                  │
├─────────────────────────────────────────────────────────────────┤
│  Frontend                      │  Backend                       │
│  ┌─────────────────────┐       │  ┌─────────────────────────┐   │
│  │  Pricing Page       │       │  │  /api/checkout          │   │
│  │  - Show plans       │──────►│  │  - Create session       │   │
│  │  - Checkout button  │       │  └───────────┬─────────────┘   │
│  └─────────────────────┘       │              │                 │
│                                │              ▼                 │
│  ┌─────────────────────┐       │     ┌────────────────┐        │
│  │  Account Page       │       │     │   STRIPE       │        │
│  │  - Current plan     │       │     │  ┌──────────┐  │        │
│  │  - Manage billing   │───────┼────►│  │ Checkout │  │        │
│  └─────────────────────┘       │     │  │ Sessions │  │        │
│                                │     │  └────┬─────┘  │        │
│                                │     │       │        │        │
│  ┌─────────────────────┐       │     │  ┌────▼─────┐  │        │
│  │  Database           │◄──────┼─────│  │ Webhooks │  │        │
│  │  - users            │       │     │  └──────────┘  │        │
│  │  - subscriptions    │       │     └────────────────┘        │
│  └─────────────────────┘       │                               │
└─────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Implementation

#### Step 1: Define Your Products in Stripe Dashboard

Before coding, create in Stripe Dashboard:
1. Go to Products → Add Product
2. Create your pricing tiers:
   - **Free**: $0/month (optional, can be app-only)
   - **Pro**: $19/month
   - **Team**: $49/month
3. Copy the `price_xxx` IDs for each

```typescript
// config/stripe.ts
export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null, // No Stripe price for free
    features: ['5 projects', 'Basic support'],
  },
  pro: {
    name: 'Pro',
    price: 19,
    priceId: 'price_xxxxxxxxxxxxx', // From Stripe Dashboard
    features: ['Unlimited projects', 'Priority support', 'API access'],
  },
  team: {
    name: 'Team',
    price: 49,
    priceId: 'price_xxxxxxxxxxxxx', // From Stripe Dashboard
    features: ['Everything in Pro', '5 team members', 'Admin dashboard'],
  },
} as const

export type PlanType = keyof typeof PLANS
```

#### Step 2: Database Schema

```typescript
// types/database.ts
interface User {
  id: string
  email: string
  stripeCustomerId: string | null
  subscriptionId: string | null
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing' | null
  plan: 'free' | 'pro' | 'team'
  currentPeriodEnd: Date | null
}
```

For **Firestore**:
```typescript
// Collection: users/{userId}
{
  email: "user@example.com",
  stripeCustomerId: "cus_xxx",
  subscriptionId: "sub_xxx",
  subscriptionStatus: "active",
  plan: "pro",
  currentPeriodEnd: Timestamp
}
```

For **SQL/Prisma**:
```prisma
model User {
  id                  String    @id @default(cuid())
  email               String    @unique
  stripeCustomerId    String?   @unique
  subscriptionId      String?   @unique
  subscriptionStatus  String?
  plan                String    @default("free")
  currentPeriodEnd    DateTime?
}
```

#### Step 3: Complete Checkout API

```typescript
// app/api/checkout/route.ts
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { auth } from '@/lib/auth' // Your auth solution
import { db } from '@/lib/db' // Your database

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId } = await req.json()
    const user = await db.user.findUnique({ where: { id: session.user.id } })

    // Get or create Stripe customer
    let customerId = user?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        metadata: { userId: session.user.id },
      })
      customerId = customer.id

      // Save customer ID to database
      await db.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      subscription_data: {
        metadata: { userId: session.user.id },
      },
      allow_promotion_codes: true, // Enable discount codes
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
```

#### Step 4: Webhook Handler (CRITICAL!)

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancel(subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
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

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const subscriptionId = session.subscription as string
  const customerId = session.customer as string

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Determine plan from price ID
  const priceId = subscription.items.data[0].price.id
  const plan = getPlanFromPriceId(priceId)

  // Update user in database
  await db.user.update({
    where: { stripeCustomerId: customerId },
    data: {
      subscriptionId,
      subscriptionStatus: subscription.status,
      plan,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  })
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0].price.id
  const plan = getPlanFromPriceId(priceId)

  await db.user.update({
    where: { subscriptionId: subscription.id },
    data: {
      subscriptionStatus: subscription.status,
      plan,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  })
}

async function handleSubscriptionCancel(subscription: Stripe.Subscription) {
  await db.user.update({
    where: { subscriptionId: subscription.id },
    data: {
      subscriptionStatus: 'canceled',
      plan: 'free',
      subscriptionId: null,
    },
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Optionally notify user of failed payment
  const customerId = invoice.customer as string
  // Send email notification, etc.
}

function getPlanFromPriceId(priceId: string): string {
  // Map your price IDs to plan names
  const priceToPlан: Record<string, string> = {
    'price_xxx': 'pro',
    'price_yyy': 'team',
  }
  return priceToPlan[priceId] || 'free'
}
```

#### Step 5: Customer Portal (Self-Service Billing)

```typescript
// app/api/billing/portal/route.ts
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } })

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'No billing account' }, { status: 400 })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  })

  return NextResponse.json({ url: portalSession.url })
}
```

---

## File Structure

After implementing this skill, your project should have:

```
src/
├── app/
│   ├── api/
│   │   ├── checkout/
│   │   │   └── route.ts        # Create checkout sessions
│   │   ├── billing/
│   │   │   └── portal/
│   │   │       └── route.ts    # Customer portal redirect
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts    # Handle Stripe webhooks
│   ├── pricing/
│   │   └── page.tsx            # Pricing page with plans
│   └── settings/
│       └── billing/
│           └── page.tsx        # Billing management page
├── config/
│   └── stripe.ts               # Plan definitions & price IDs
├── lib/
│   └── stripe.ts               # Stripe client instance
└── components/
    ├── pricing-card.tsx        # Individual plan card
    └── checkout-button.tsx     # Checkout trigger button
```

---

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Yes | Server-side API key | `sk_test_...` or `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook signature verification | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Client-side key | `pk_test_...` or `pk_live_...` |
| `NEXT_PUBLIC_APP_URL` | Yes | Your app URL for redirects | `https://yourapp.com` |

---

## Common Gotchas

### Gotcha 1: Webhook Signature Fails in Development
**Problem:** `stripe.webhooks.constructEvent` throws "No signatures found"
**Solution:** Use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and use the webhook secret it provides (starts with `whsec_...`)

### Gotcha 2: Raw Body Required for Webhooks
**Problem:** Webhook verification fails because Next.js parses JSON automatically
**Solution:** In App Router, `req.text()` gives you the raw body. In Pages Router, disable body parsing:
```typescript
export const config = { api: { bodyParser: false } }
```

### Gotcha 3: Customer Created Before Subscription
**Problem:** Webhook `customer.subscription.created` fires but user doesn't have `stripeCustomerId` yet
**Solution:** Always create/get customer BEFORE checkout, not after. Store customer ID immediately.

### Gotcha 4: Test vs Live Mode Confusion
**Problem:** Webhooks work in test but not production
**Solution:** You need SEPARATE webhook endpoints in Stripe Dashboard for test and live modes. Each has a different secret.

### Gotcha 5: Price IDs Change Between Environments
**Problem:** Test price IDs don't work in production
**Solution:** Create identical products in live mode and use environment-specific config:
```typescript
const priceId = process.env.NODE_ENV === 'production'
  ? 'price_live_xxx'
  : 'price_test_xxx'
```

---

## Security Checklist

- [ ] Webhook signature verification is implemented
- [ ] API routes check authentication before creating sessions
- [ ] Customer ID is linked to your user ID
- [ ] Sensitive keys are in environment variables, not code
- [ ] Production uses `sk_live_*` keys, not test keys
- [ ] Webhook endpoint is not rate-limited (Stripe retries)
- [ ] Error messages don't expose internal details

---

## Testing Checklist

- [ ] Can create checkout session for each plan
- [ ] Checkout redirects work (success and cancel)
- [ ] Webhook receives `checkout.session.completed`
- [ ] User plan updates after successful payment
- [ ] Customer portal opens correctly
- [ ] Subscription cancellation updates user plan to free
- [ ] Failed payment webhook is received
- [ ] Test with Stripe CLI: `stripe trigger checkout.session.completed`

---

## MCP Usage

When implementing this skill with Claude Code:

```
Use context7 to fetch the latest Stripe Node.js SDK documentation
Use context7 to get Next.js App Router patterns for API routes
```

---

## Related Skills

- `firebase-auth` - User authentication to link with payments
- `supabase-stack` - Alternative with built-in Postgres for subscription data
- `nextjs-app-router` - API routes and server components

---

## References

- [Stripe Checkout Quickstart](https://stripe.com/docs/checkout/quickstart)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Stripe CLI for Testing](https://stripe.com/docs/stripe-cli)
