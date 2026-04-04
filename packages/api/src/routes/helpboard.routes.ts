import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authenticate } from '../middleware/auth'
import {
  createPost, getPosts, getPostById,
  createAnswer, votePost, voteAnswer, acceptAnswer,
} from '../services/helpboard.service'

export const helpboardRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', authenticate)

  // ── GET /help ─────────────────────────────────────────────────────
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { page?: string; chapterId?: string }
    const result = await getPosts(
      parseInt(query.page || '1'),
      20,
      query.chapterId
    )
    return reply.send(result)
  })

  // ── GET /help/:postId ─────────────────────────────────────────────
  app.get('/:postId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { postId } = request.params as { postId: string }
    try {
      const post = await getPostById(postId)
      return reply.send({ post })
    } catch {
      return reply.status(404).send({ error: 'Post not found' })
    }
  })

  // ── POST /help ────────────────────────────────────────────────────
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).currentUser
    const body = request.body as {
      title?: string
      body?: string
      chapterId?: string
    }

    if (!body?.title || body.title.trim().length < 5) {
      return reply.status(400).send({ error: 'Title must be at least 5 characters' })
    }
    if (!body?.body || body.body.trim().length < 10) {
      return reply.status(400).send({ error: 'Question body must be at least 10 characters' })
    }

    try {
      const post = await createPost(user.id, body.title, body.body, body.chapterId)
      return reply.status(201).send({ post })
    } catch {
      return reply.status(500).send({ error: 'Could not create post' })
    }
  })

  // ── POST /help/:postId/answer ─────────────────────────────────────
  app.post('/:postId/answer', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).currentUser
    const { postId } = request.params as { postId: string }
    const body = request.body as { body?: string }

    if (!body?.body || body.body.trim().length < 5) {
      return reply.status(400).send({ error: 'Answer must be at least 5 characters' })
    }

    try {
      const answer = await createAnswer(user.id, postId, body.body)
      return reply.status(201).send({ answer })
    } catch (err: any) {
      if (err.message === 'POST_NOT_FOUND')
        return reply.status(404).send({ error: 'Post not found' })
      return reply.status(500).send({ error: 'Could not post answer' })
    }
  })

 // ── POST /help/:postId/vote ───────────────────────────────────────
  app.post('/:postId/vote', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).currentUser
    const { postId } = request.params as { postId: string }

    try {
      const post = await votePost(user.id, postId)
      return reply.send({ post })
    } catch (err: any) {
      if (err.message === 'ALREADY_VOTED')
        return reply.status(409).send({ error: 'You have already voted on this post' })
      return reply.status(500).send({ error: 'Could not vote' })
    }
  })

  // ── POST /help/answer/:answerId/vote ──────────────────────────────
  app.post('/answer/:answerId/vote', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).currentUser
    const { answerId } = request.params as { answerId: string }

    try {
      const answer = await voteAnswer(user.id, answerId)
      return reply.send({ answer })
    } catch (err: any) {
      if (err.message === 'ALREADY_VOTED')
        return reply.status(409).send({ error: 'You have already voted on this answer' })
      if (err.message === 'CANNOT_VOTE_OWN')
        return reply.status(403).send({ error: 'You cannot vote on your own answer' })
      return reply.status(500).send({ error: 'Could not vote' })
    }
  })

  // ── POST /help/answer/:answerId/accept ────────────────────────────
  app.post('/answer/:answerId/accept', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).currentUser
    const { answerId } = request.params as { answerId: string }
    try {
      await acceptAnswer(user.id, answerId)
      return reply.send({ success: true })
    } catch (err: any) {
      if (err.message === 'NOT_POST_OWNER')
        return reply.status(403).send({ error: 'Only the post author can accept answers' })
      return reply.status(500).send({ error: 'Could not accept answer' })
    }
  })
}