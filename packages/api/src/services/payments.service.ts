import Stripe from 'stripe'
import { prisma } from '@lexoria/database'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

const VIP_PRICE_ID = process.env.STRIPE_VIP_PRICE_ID || ''

// ── Create or retrieve Stripe customer ────────────────────────────
const getOrCreateCustomer = async (userId: string, email: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (subscription?.stripeCustomerId) {
    return subscription.stripeCustomerId
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  })

  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, stripeCustomerId: customer.id, status: 'INACTIVE' },
    update: { stripeCustomerId: customer.id },
  })

  return customer.id
}

// ── Create a checkout session ─────────────────────────────────────
export const createCheckoutSession = async (
  userId: string,
  email: string,
  successUrl: string,
  cancelUrl: string
) => {
  const customerId = await getOrCreateCustomer(userId, email)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: VIP_PRICE_ID, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
  })

  return { url: session.url, sessionId: session.id }
}

// ── Create a billing portal session ──────────────────────────────
export const createPortalSession = async (userId: string, returnUrl: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription?.stripeCustomerId) {
    throw new Error('NO_CUSTOMER')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: returnUrl,
  })

  return { url: session.url }
}

// ── Handle Stripe webhook events ──────────────────────────────────
export const handleWebhook = async (payload: Buffer, signature: string) => {
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch {
    throw new Error('INVALID_SIGNATURE')
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      if (!userId) break

      await activateVIP(userId, session.subscription as string)
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(sub.customer as string)
      if (customer.deleted) break

      const userId = (customer as Stripe.Customer).metadata?.userId
      if (!userId) break

      if (sub.status === 'active') {
        await activateVIP(userId, sub.id)
      } else {
        await deactivateVIP(userId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(sub.customer as string)
      if (customer.deleted) break

      const userId = (customer as Stripe.Customer).metadata?.userId
      if (!userId) break

      await deactivateVIP(userId)
      break
    }
  }

  return { received: true }
}

// ── Activate VIP ──────────────────────────────────────────────────
const activateVIP = async (userId: string, stripeSubscriptionId: string) => {
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId)

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeSubscriptionId,
      status: 'ACTIVE',
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    },
    update: {
      stripeSubscriptionId,
      status: 'ACTIVE',
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    },
  })

  await prisma.user.update({
    where: { id: userId },
    data: { tier: 'VIP' },
  })
}

// ── Deactivate VIP ────────────────────────────────────────────────
const deactivateVIP = async (userId: string) => {
  await prisma.subscription.update({
    where: { userId },
    data: { status: 'CANCELLED' },
  })

  await prisma.user.update({
    where: { id: userId },
    data: { tier: 'FREE' },
  })
}

// ── Get subscription status ───────────────────────────────────────
export const getSubscriptionStatus = async (userId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  return {
    tier: subscription?.status === 'ACTIVE' ? 'VIP' : 'FREE',
    status: subscription?.status ?? 'INACTIVE',
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
  }
}

// ── Manual VIP grant (for testing) ───────────────────────────────
export const grantVIPManually = async (userId: string) => {
  const futureDate = new Date()
  futureDate.setMonth(futureDate.getMonth() + 1)

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      status: 'ACTIVE',
      currentPeriodEnd: futureDate,
    },
    update: {
      status: 'ACTIVE',
      currentPeriodEnd: futureDate,
    },
  })

  await prisma.user.update({
    where: { id: userId },
    data: { tier: 'VIP' },
  })

  return { success: true }
}