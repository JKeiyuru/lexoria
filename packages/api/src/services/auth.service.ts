import { prisma } from '@lexoria/database'
import { hashPassword, verifyPassword } from '../utils/hash'
import { generateRefreshToken } from '../utils/tokens'
import { calculateLevel } from '../utils/xp'

export interface RegisterInput {
  email: string
  username: string
  password: string
  age?: number
}

export interface LoginInput {
  email: string
  password: string
}

export const registerUser = async (input: RegisterInput) => {
  const { email, username, password, age } = input

  // Check existing
  const existingEmail = await prisma.user.findUnique({ where: { email } })
  if (existingEmail) throw new Error('EMAIL_TAKEN')

  const existingUsername = await prisma.user.findUnique({ where: { username } })
  if (existingUsername) throw new Error('USERNAME_TAKEN')

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      age,
      subscription: {
        create: { status: 'INACTIVE' },
      },
    },
    select: {
      id: true,
      email: true,
      username: true,
      tier: true,
      level: true,
      totalXP: true,
      avatarConfig: true,
      createdAt: true,
    },
  })

  return user
}

export const loginUser = async (input: LoginInput) => {
  const { email, password } = input

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('INVALID_CREDENTIALS')
  if (!user.passwordHash) throw new Error('OAUTH_ACCOUNT') // Google-only account

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) throw new Error('INVALID_CREDENTIALS')

  // Update last active + streak
  const now = new Date()
  const lastActive = user.lastActiveAt
  const hoursSinceLastActive =
    (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60)

  let streakDays = user.streakDays
  if (hoursSinceLastActive >= 24 && hoursSinceLastActive < 48) {
    streakDays += 1
  } else if (hoursSinceLastActive >= 48) {
    streakDays = 1
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastActiveAt: now, streakDays },
  })

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    tier: user.tier,
    level: user.level,
    totalXP: user.totalXP,
    avatarConfig: user.avatarConfig,
    streakDays,
  }
}

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      tier: true,
      level: true,
      totalXP: true,
      avatarConfig: true,
      streakDays: true,
      createdAt: true,
      subjectXP: {
        include: { subject: { select: { name: true, slug: true, color: true } } },
      },
      achievements: {
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' },
        take: 10,
      },
      guildMemberships: {
        include: { guild: { select: { id: true, name: true, emblemUrl: true } } },
        take: 1,
      },
    },
  })

  if (!user) throw new Error('USER_NOT_FOUND')
  return user
}

export const updateAvatar = async (userId: string, avatarConfig: object) => {
  return prisma.user.update({
    where: { id: userId },
    data: { avatarConfig },
    select: { id: true, avatarConfig: true },
  })
}