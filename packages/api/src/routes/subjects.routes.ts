import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authenticate } from '../middleware/auth'
import {
  getAllSubjects,
  getSubjectBySlug,
  getSeasonWithChapters,
  getChapterById,
} from '../services/subjects.service'
import { completeChapter, getUserProgressSummary } from '../services/progress.service'

export const subjectRoutes = async (app: FastifyInstance) => {

  // All routes require auth
  app.addHook('preHandler', authenticate)

  // ── GET /subjects ────────────────────────────────────────────────
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).currentUser
    const subjects = await getAllSubjects(user.tier)
    return reply.send({ subjects })
  })

  // ── GET /subjects/:slug ──────────────────────────────────────────
  app.get('/:slug', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).currentUser
    const { slug } = request.params as { slug: string }

    try {
      const subject = await getSubjectBySlug(slug, user.tier)
      return reply.send({ subject })
    } catch (err: any) {
      if (err.message === 'SUBJECT_NOT_FOUND')
        return reply.status(404).send({ error: 'Subject not found' })
      return reply.status(500).send({ error: 'Something went wrong' })
    }
  })

  // ── GET /subjects/season/:seasonId ───────────────────────────────
  app.get(
    '/season/:seasonId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).currentUser
      const { seasonId } = request.params as { seasonId: string }

      try {
        const season = await getSeasonWithChapters(seasonId, user.tier, user.id)
        return reply.send({ season })
      } catch (err: any) {
        if (err.message === 'SEASON_NOT_FOUND')
          return reply.status(404).send({ error: 'Season not found' })
        if (err.message === 'LOCKED')
          return reply.status(403).send({ error: 'This season requires VIP' })
        return reply.status(500).send({ error: 'Something went wrong' })
      }
    }
  )

  // ── GET /subjects/chapter/:chapterId ─────────────────────────────
  app.get(
    '/chapter/:chapterId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).currentUser
      const { chapterId } = request.params as { chapterId: string }

      try {
        const chapter = await getChapterById(chapterId, user.tier, user.id)
        return reply.send({ chapter })
      } catch (err: any) {
        if (err.message === 'CHAPTER_NOT_FOUND')
          return reply.status(404).send({ error: 'Chapter not found' })
        if (err.message === 'LOCKED')
          return reply.status(403).send({ error: 'This chapter requires VIP' })
        return reply.status(500).send({ error: 'Something went wrong' })
      }
    }
  )

  // ── POST /subjects/chapter/:chapterId/complete ───────────────────
  app.post(
    '/chapter/:chapterId/complete',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).currentUser
      const { chapterId } = request.params as { chapterId: string }
      const body = request.body as {
        mode?: 'STORY' | 'TECHNICAL'
        score?: number
      }

      try {
        const result = await completeChapter(
          user.id,
          chapterId,
          body.mode || 'STORY',
          body.score || 100
        )
        return reply.send(result)
      } catch (err: any) {
        if (err.message === 'CHAPTER_NOT_FOUND')
          return reply.status(404).send({ error: 'Chapter not found' })
        return reply.status(500).send({ error: 'Something went wrong' })
      }
    }
  )

  // ── GET /subjects/progress/summary ──────────────────────────────
  app.get(
    '/progress/summary',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).currentUser
      const summary = await getUserProgressSummary(user.id)
      return reply.send({ summary })
    }
  )
}