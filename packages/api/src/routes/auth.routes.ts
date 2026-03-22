import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { registerUser, loginUser, getUserProfile, updateAvatar } from '../services/auth.service'
import { generateRefreshToken, rotateRefreshToken, revokeRefreshToken } from '../utils/token'
import { authenticate } from '../middleware/auth'

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username max 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  age: z.number().int().min(10).max(100).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authRoutes = async (app: FastifyInstance) => {

  // ── POST /auth/register ──────────────────────────────────────────
  app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = registerSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        details: parsed.error.flatten().fieldErrors,
      })
    }

    try {
      const user = await registerUser(parsed.data)

      const accessToken = app.jwt.sign(
        { userId: user.id, email: user.email },
        { expiresIn: '15m' }
      )
      const refreshToken = await generateRefreshToken(user.id)

      reply.setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })

      return reply.status(201).send({
        message: 'Account created successfully',
        user,
        accessToken,
      })
    } catch (err: any) {
      if (err.message === 'EMAIL_TAKEN') {
        return reply.status(409).send({ error: 'An account with this email already exists' })
      }
      if (err.message === 'USERNAME_TAKEN') {
        return reply.status(409).send({ error: 'This username is already taken' })
      }
      console.error(err)
      return reply.status(500).send({ error: 'Something went wrong' })
    }
  })

  // ── POST /auth/login ─────────────────────────────────────────────
  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = loginSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid input' })
    }

    try {
      const user = await loginUser(parsed.data)

      const accessToken = app.jwt.sign(
        { userId: user.id, email: user.email },
        { expiresIn: '15m' }
      )
      const refreshToken = await generateRefreshToken(user.id)

      reply.setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })

      return reply.send({
        message: 'Login successful',
        user,
        accessToken,
      })
    } catch (err: any) {
      if (
        err.message === 'INVALID_CREDENTIALS' ||
        err.message === 'OAUTH_ACCOUNT'
      ) {
        return reply.status(401).send({ error: 'Invalid email or password' })
      }
      console.error(err)
      return reply.status(500).send({ error: 'Something went wrong' })
    }
  })

  // ── POST /auth/refresh ───────────────────────────────────────────
  app.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    const token = (request.cookies as any)?.refreshToken
    if (!token) {
      return reply.status(401).send({ error: 'No refresh token' })
    }

    const result = await rotateRefreshToken(token)
    if (!result) {
      return reply.status(401).send({ error: 'Invalid or expired refresh token' })
    }

    const accessToken = app.jwt.sign(
      { userId: result.userId },
      { expiresIn: '15m' }
    )

    reply.setCookie('refreshToken', result.newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return reply.send({ accessToken })
  })

  // ── POST /auth/logout ────────────────────────────────────────────
  app.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    const token = (request.cookies as any)?.refreshToken
    if (token) await revokeRefreshToken(token)

    reply.clearCookie('refreshToken', { path: '/' })
    return reply.send({ message: 'Logged out successfully' })
  })

  // ── GET /auth/me ─────────────────────────────────────────────────
  app.get(
    '/me',
    { preHandler: authenticate },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const currentUser = (request as any).currentUser
        const profile = await getUserProfile(currentUser.id)
        return reply.send({ user: profile })
      } catch (err) {
        return reply.status(404).send({ error: 'User not found' })
      }
    }
  )

  // ── PATCH /auth/avatar ───────────────────────────────────────────
  app.patch(
    '/avatar',
    { preHandler: authenticate },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = (request as any).currentUser
      const body = request.body as { avatarConfig: object }

      if (!body?.avatarConfig || typeof body.avatarConfig !== 'object') {
        return reply.status(400).send({ error: 'avatarConfig is required' })
      }

      const result = await updateAvatar(currentUser.id, body.avatarConfig)
      return reply.send({ message: 'Avatar updated', ...result })
    }
  )
}