import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authenticate } from '../middleware/auth'
import {
  getMentorHint,
  getMentorExplanation,
  getMentorCelebration,
} from '../services/mentor.service'

export const mentorRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', authenticate)

  // ── POST /mentor/hint ─────────────────────────────────────────────
  app.post('/hint', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).currentUser
    const body = request.body as {
      challengeId: string
      userCode?: string
      errorMessage?: string
      mode?: 'STORY' | 'TECHNICAL'
    }

    if (!body?.challengeId) {
      return reply.status(400).send({ error: 'challengeId is required' })
    }

    try {
      const result = await getMentorHint(
        user.id,
        body.challengeId,
        body.userCode || '',
        body.errorMessage || '',
        body.mode || 'STORY'
      )
      return reply.send(result)
    } catch (err: any) {
      if (err.message === 'CHALLENGE_NOT_FOUND') {
        return reply.status(404).send({ error: 'Challenge not found' })
      }
      console.error('Mentor hint error:', err)
      return reply.status(500).send({ error: 'Mentor is unavailable right now' })
    }
  })

  // ── POST /mentor/explain ──────────────────────────────────────────
  app.post('/explain', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).currentUser
    const body = request.body as {
      chapterId: string
      question: string
      mode?: 'STORY' | 'TECHNICAL'
    }

    if (!body?.chapterId || !body?.question) {
      return reply.status(400).send({ error: 'chapterId and question are required' })
    }

    if (body.question.length > 500) {
      return reply.status(400).send({ error: 'Question too long' })
    }

    try {
      const result = await getMentorExplanation(
        user.id,
        body.chapterId,
        body.question,
        body.mode || 'STORY'
      )
      return reply.send(result)
    } catch (err: any) {
      if (err.message === 'CHAPTER_NOT_FOUND') {
        return reply.status(404).send({ error: 'Chapter not found' })
      }
      console.error('Mentor explain error:', err)
      return reply.status(500).send({ error: 'Mentor is unavailable right now' })
    }
  })

  // ── POST /mentor/celebrate ────────────────────────────────────────
  app.post('/celebrate', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as {
      subjectSlug: string
      chapterTitle: string
      mode?: 'STORY' | 'TECHNICAL'
    }

    if (!body?.subjectSlug || !body?.chapterTitle) {
      return reply.status(400).send({ error: 'subjectSlug and chapterTitle are required' })
    }

    try {
      const result = await getMentorCelebration(
        body.subjectSlug,
        body.chapterTitle,
        body.mode || 'STORY'
      )
      return reply.send(result)
    } catch (err: any) {
      console.error('Mentor celebrate error:', err)
      return reply.status(500).send({ error: 'Mentor is unavailable right now' })
    }
  })
}