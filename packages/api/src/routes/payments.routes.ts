import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authenticate } from '../middleware/auth'
import {
  createCheckoutSession,
  createPortalSession,
  handleWebhook,
  getSubscriptionStatus,
  grantVIPManually,
} from '../services/payments.service'

export const paymentRoutes = async (app: FastifyInstance) => {

  // ── POST /payments/webhook (no auth — Stripe calls this) ──────────
  app.post(
    '/webhook',
    { config: { rawBody: true } },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const signature = request.headers['stripe-signature'] as string
      if (!signature) {
        return reply.status(400).send({ error: 'No signature' })
      }

      try {
        const result = await handleWebhook(
          (request as any).rawBody,
          signature
        )
        return reply.send(result)
      } catch (err: any) {
        if (err.message === 'INVALID_SIGNATURE') {
          return reply.status(400).send({ error: 'Invalid webhook signature' })
        }
        return reply.status(500).send({ error: 'Webhook failed' })
      }
    }
  )

  // All routes below require auth
  app.addHook('preHandler', authenticate)

  // ── GET /payments/status ──────────────────────────────────────────
  app.get('/status', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).currentUser
    const status = await getSubscriptionStatus(user.id)
    return reply.send(status)
  })

  // ── POST /payments/checkout ───────────────────────────────────────
  app.post('/checkout', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).currentUser

    try {
      const session = await createCheckoutSession(
        user.id,
        user.email,
        'https://lexoria.app/success',
        'https://lexoria.app/cancel'
      )
      return reply.send(session)
    } catch (err) {
      console.error(err)
      return reply.status(500).send({ error: 'Could not create checkout session' })
    }
  })

  // ── POST /payments/portal ─────────────────────────────────────────
  app.post('/portal', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).currentUser

    try {
      const session = await createPortalSession(
        user.id,
        'https://lexoria.app/profile'
      )
      return reply.send(session)
    } catch (err: any) {
      if (err.message === 'NO_CUSTOMER') {
        return reply.status(400).send({ error: 'No subscription found' })
      }
      return reply.status(500).send({ error: 'Could not open billing portal' })
    }
  })

  // ── POST /payments/grant-vip (TESTING ONLY) ───────────────────────
  app.post('/grant-vip', async (request: FastifyRequest, reply: FastifyReply) => {
    if (process.env.NODE_ENV === 'production') {
      return reply.status(403).send({ error: 'Not available in production' })
    }
    const user = (request as any).currentUser
    const result = await grantVIPManually(user.id)
    return reply.send(result)
  })
}