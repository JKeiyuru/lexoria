import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authenticate } from '../middleware/auth'
import { executeCode, submitChallenge, extractUserOutput } from '../services/execution.service'

export const executionRoutes = async (app: FastifyInstance) => {

  app.addHook('preHandler', authenticate)

  // ── POST /execute/run ─────────────────────────────────────────────
  // Free-form code execution — just run and return output
  app.post('/run', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { code?: string }

    if (!body?.code || typeof body.code !== 'string') {
      return reply.status(400).send({ error: 'code is required' })
    }

    if (body.code.length > 10000) {
      return reply.status(400).send({ error: 'Code too long (max 10,000 characters)' })
    }

    try {
      const result = await executeCode(body.code)
      return reply.send(result)
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || 'Execution failed' })
    }
  })

  // ── POST /execute/challenge/:challengeId ──────────────────────────
  // Submit code for a specific challenge — runs tests and awards XP
  app.post(
    '/challenge/:challengeId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).currentUser
      const { challengeId } = request.params as { challengeId: string }
      const body = request.body as { code?: string }

      if (!body?.code || typeof body.code !== 'string') {
        return reply.status(400).send({ error: 'code is required' })
      }

      if (body.code.length > 10000) {
        return reply.status(400).send({ error: 'Code too long' })
      }

      try {
        const result = await submitChallenge(user.id, challengeId, body.code)

        // Clean output for user display
        if (result.output) {
          result.output = extractUserOutput(result.output)
        }

        return reply.send(result)
      } catch (err: any) {
        if (err.message === 'CHALLENGE_NOT_FOUND') {
          return reply.status(404).send({ error: 'Challenge not found' })
        }
        console.error(err)
        return reply.status(500).send({ error: 'Execution failed' })
      }
    }
  )
}