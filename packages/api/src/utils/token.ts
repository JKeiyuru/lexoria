import crypto from 'crypto'
import { prisma } from '@lexoria/database'

export const generateRefreshToken = async (userId: string): Promise<string> => {
  const token = crypto.randomBytes(64).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  })

  return token
}

export const rotateRefreshToken = async (
  oldToken: string
): Promise<{ userId: string; newToken: string } | null> => {
  const existing = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
  })

  if (!existing || existing.expiresAt < new Date()) {
    return null
  }

  await prisma.refreshToken.delete({ where: { token: oldToken } })

  const newToken = await generateRefreshToken(existing.userId)
  return { userId: existing.userId, newToken }
}

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({ where: { token } })
}