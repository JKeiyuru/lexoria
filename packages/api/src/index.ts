import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import { authRoutes } from './routes/auth.routes'
import { subjectRoutes } from './routes/subjects.routes'
import { executionRoutes } from './routes/execution.routes'
import { mentorRoutes } from './routes/mentor.routes'
import { gamificationRoutes } from './routes/gamification.routes'
import { guildRoutes } from './routes/guilds.routes'
import { helpboardRoutes } from './routes/helpboard.routes'
import { paymentRoutes } from './routes/payments.routes'

const app = Fastify({
  logger: true,
  bodyLimit: 1048576,
})

// Add raw body support for Stripe webhooks
app.addContentTypeParser(
  'application/json',
  { parseAs: 'buffer' },
  (req, body, done) => {
    try {
      ;(req as any).rawBody = body
      const json = JSON.parse(body.toString())
      done(null, json)
    } catch (err: any) {
      done(err, undefined)
    }
  }
)

// ── Plugins ──────────────────────────────────────────────────────
app.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
})

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'lexoria-dev-secret-change-in-production',
})

app.register(cookie)

// ── Routes ────────────────────────────────────────────────────────
app.register(authRoutes, { prefix: '/auth' })
app.register(subjectRoutes, { prefix: '/subjects' })
app.register(executionRoutes, { prefix: '/execute' })
app.register(mentorRoutes, { prefix: '/mentor' })
app.register(gamificationRoutes, { prefix: '/gamification' })
app.register(guildRoutes, { prefix: '/guilds' })
app.register(helpboardRoutes, { prefix: '/help' })
app.register(paymentRoutes, { prefix: '/payments' })

// ── Health check ──────────────────────────────────────────────────
app.get('/health', async () => {
  return { status: 'ok', service: 'Lexoria API', timestamp: new Date().toISOString() }
})

// ── Start ─────────────────────────────────────────────────────────
const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3001, host: '0.0.0.0' })
    console.log('🚀 Lexoria API running on port 3001')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()