import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authenticate } from '../middleware/auth'
import {
  getUserAchievements,
  getLeaderboard,
  checkAndAwardAchievements,
} from '../services/achievements.service'

export const gamificationRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', authenticate)

  // ── GET /gamification/achievements ───────────────────────────────
  app.get('/achievements', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).currentUser
    try {
      const data = await getUserAchievements(user.id)
      return reply.send(data)
    } catch (err) {
      return reply.status(500).send({ error: 'Could not load achievements' })
    }
  })

  // ── POST /gamification/achievements/check ─────────────────────────
  app.post(
    '/achievements/check',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).currentUser
      try {
        const newAchievements = await checkAndAwardAchievements(user.id)
        return reply.send({ newAchievements })
      } catch (err) {
        return reply.status(500).send({ error: 'Could not check achievements' })
      }
    }
  )

  // ── GET /gamification/leaderboard ────────────────────────────────
  app.get('/leaderboard', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const board = await getLeaderboard(20)
      return reply.send({ leaderboard: board })
    } catch (err) {
      return reply.status(500).send({ error: 'Could not load leaderboard' })
    }
  })

  // ── GET /gamification/streak ──────────────────────────────────────
  app.get('/streak', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).currentUser
    try {
      const dbUser = await (await import('@lexoria/database')).prisma.user.findUnique({
        where: { id: user.id },
        select: { streakDays: true, lastActiveAt: true },
      })
      if (!dbUser) return reply.status(404).send({ error: 'User not found' })

      const now = new Date()
      const hours = (now.getTime() - dbUser.lastActiveAt.getTime()) / (1000 * 60 * 60)
      const streakAtRisk = hours > 20 // warn after 20 hours

      return reply.send({
        streakDays: dbUser.streakDays,
        lastActiveAt: dbUser.lastActiveAt,
        streakAtRisk,
        hoursUntilLost: Math.max(0, Math.round(48 - hours)),
      })
    } catch (err) {
      return reply.status(500).send({ error: 'Could not load streak' })
    }
  })
}