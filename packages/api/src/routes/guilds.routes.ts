import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authenticate } from '../middleware/auth'
import {
  createGuild, joinGuild, leaveGuild,
  getAllGuilds, getGuildById, getUserGuild,
} from '../services/guilds.service'

export const guildRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', authenticate)

  // ── GET /guilds ───────────────────────────────────────────────────
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const guilds = await getAllGuilds()
    return reply.send({ guilds })
  })

  // ── GET /guilds/mine ──────────────────────────────────────────────
  app.get('/mine', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).currentUser
    const membership = await getUserGuild(user.id)
    return reply.send({ membership })
  })

  // ── GET /guilds/:guildId ──────────────────────────────────────────
  app.get('/:guildId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { guildId } = request.params as { guildId: string }
    try {
      const guild = await getGuildById(guildId)
      return reply.send({ guild })
    } catch {
      return reply.status(404).send({ error: 'Guild not found' })
    }
  })

  // ── POST /guilds/create ───────────────────────────────────────────
  app.post('/create', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).currentUser
    const body = request.body as { name?: string; description?: string }

    if (!body?.name || body.name.trim().length < 3) {
      return reply.status(400).send({ error: 'Guild name must be at least 3 characters' })
    }

    try {
      const guild = await createGuild(user.id, body.name.trim(), body.description)
      return reply.status(201).send({ guild })
    } catch (err: any) {
      if (err.message === 'ALREADY_IN_GUILD')
        return reply.status(409).send({ error: 'You are already in a guild' })
      if (err.message === 'NAME_TAKEN')
        return reply.status(409).send({ error: 'That guild name is already taken' })
      return reply.status(500).send({ error: 'Could not create guild' })
    }
  })

  // ── POST /guilds/:guildId/join ────────────────────────────────────
  app.post('/:guildId/join', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).currentUser
    const { guildId } = request.params as { guildId: string }

    try {
      const guild = await joinGuild(user.id, guildId)
      return reply.send({ guild })
    } catch (err: any) {
      if (err.message === 'ALREADY_IN_GUILD')
        return reply.status(409).send({ error: 'You are already in a guild' })
      if (err.message === 'GUILD_NOT_FOUND')
        return reply.status(404).send({ error: 'Guild not found' })
      return reply.status(500).send({ error: 'Could not join guild' })
    }
  })

  // ── POST /guilds/leave ────────────────────────────────────────────
  app.post('/leave', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).currentUser
    try {
      await leaveGuild(user.id)
      return reply.send({ success: true })
    } catch (err: any) {
      if (err.message === 'NOT_IN_GUILD')
        return reply.status(400).send({ error: 'You are not in a guild' })
      return reply.status(500).send({ error: 'Could not leave guild' })
    }
  })
}