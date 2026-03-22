import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@lexoria/database'

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    await request.jwtVerify()

    const payload = request.user as { userId: string; email: string }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        tier: true,
        level: true,
        totalXP: true,
        avatarConfig: true,
      },
    })

    if (!user) {
      return reply.status(401).send({ error: 'User not found' })
    }

    // Attach full user to request
    ;(request as any).currentUser = user
  } catch (err) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }
}