import { prisma } from '@lexoria/database'
import { calculateLevel } from '../utils/xp'
import { checkAndAwardAchievements } from './achievements.service'

export const completeChapter = async (
  userId: string,
  chapterId: string,
  mode: 'STORY' | 'TECHNICAL',
  score: number
) => {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { season: { include: { subject: true } } },
  })

  if (!chapter) throw new Error('CHAPTER_NOT_FOUND')

  // Upsert progress (idempotent — completing twice doesn't double XP)
  const existing = await prisma.userProgress.findUnique({
    where: { userId_chapterId: { userId, chapterId } },
  })

  if (existing) {
    return { alreadyCompleted: true, xpEarned: 0 }
  }

  await prisma.userProgress.create({
    data: { userId, chapterId, mode, score },
  })

  // Award XP
  const xpEarned = chapter.xpReward

  // Update global user XP + level
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { totalXP: { increment: xpEarned } },
  })
  const newLevel = calculateLevel(updatedUser.totalXP)
  if (newLevel !== updatedUser.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    })
  }

  // Update subject-specific XP
  const subjectXP = await prisma.userSubjectXP.upsert({
    where: {
      userId_subjectId: { userId, subjectId: chapter.season.subjectId },
    },
    create: {
      userId,
      subjectId: chapter.season.subjectId,
      xp: xpEarned,
      level: 1,
    },
    update: { xp: { increment: xpEarned } },
  })

  const newSubjectLevel = calculateLevel(subjectXP.xp + xpEarned)
  if (newSubjectLevel !== subjectXP.level) {
    await prisma.userSubjectXP.update({
      where: { userId_subjectId: { userId, subjectId: chapter.season.subjectId } },
      data: { level: newSubjectLevel },
    })
  }

  // Update guild XP if member
  const membership = await prisma.guildMember.findFirst({ where: { userId } })
  if (membership) {
    await prisma.guild.update({
      where: { id: membership.guildId },
      data: { totalXP: { increment: xpEarned } },
    })
  }

  // Check for newly unlocked achievements
  const newAchievements = await checkAndAwardAchievements(userId)

  return {
    alreadyCompleted: false,
    xpEarned,
    newTotalXP: updatedUser.totalXP + xpEarned,
    newLevel,
    levelUp: newLevel !== updatedUser.level,
    newAchievements,
  }

  return {
    alreadyCompleted: false,
    xpEarned,
    newTotalXP: updatedUser.totalXP + xpEarned,
    newLevel,
    levelUp: newLevel !== updatedUser.level,
  }
}

export const getUserProgressSummary = async (userId: string) => {
  const [totalChapters, completedChapters, subjectXP] = await Promise.all([
    prisma.chapter.count(),
    prisma.userProgress.count({ where: { userId } }),
    prisma.userSubjectXP.findMany({
      where: { userId },
      include: { subject: { select: { name: true, slug: true, color: true } } },
    }),
  ])

  return {
    totalChapters,
    completedChapters,
    completionRate:
      totalChapters > 0
        ? Math.round((completedChapters / totalChapters) * 100)
        : 0,
    subjectXP,
  }
}