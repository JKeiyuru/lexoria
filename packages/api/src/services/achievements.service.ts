import { prisma } from '@lexoria/database'

// ── Check and award achievements after any XP event ───────────────
export const checkAndAwardAchievements = async (userId: string) => {
  const [
    user,
    completedChapters,
    passedBosses,
    existingAchievements,
    achievements,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.userProgress.count({ where: { userId } }),
    prisma.challengeAttempt.count({
      where: {
        userId,
        passed: true,
        challenge: { type: 'BOSS' },
      },
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    }),
    prisma.achievement.findMany(),
  ])

  if (!user) return []

  const alreadyUnlocked = new Set(existingAchievements.map((a) => a.achievementId))
  const newlyUnlocked: string[] = []

  for (const achievement of achievements) {
    if (alreadyUnlocked.has(achievement.id)) continue

    const condition = achievement.condition as any
    let earned = false

    switch (condition.type) {
      case 'chapters_completed':
        earned = completedChapters >= condition.count
        break

      case 'boss_defeated':
        earned = passedBosses >= condition.count
        break

      case 'streak':
        earned = user.streakDays >= condition.days
        break

      case 'level_reached':
        earned = user.level >= condition.level
        break

      case 'xp_earned':
        earned = user.totalXP >= condition.amount
        break

      case 'season_completed': {
        const seasonChapters = await prisma.chapter.findMany({
          where: { seasonId: condition.seasonId },
          select: { id: true },
        })
        const completedInSeason = await prisma.userProgress.count({
          where: {
            userId,
            chapterId: { in: seasonChapters.map((c) => c.id) },
          },
        })
        earned = completedInSeason >= seasonChapters.length && seasonChapters.length > 0
        break
      }
    }

    if (earned) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      })

      // Award achievement XP bonus
      if (achievement.xpReward > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { totalXP: { increment: achievement.xpReward } },
        })
      }

      newlyUnlocked.push(achievement.id)
    }
  }

  if (newlyUnlocked.length === 0) return []

  return prisma.achievement.findMany({
    where: { id: { in: newlyUnlocked } },
  })
}

// ── Get all achievements with user unlock status ──────────────────
export const getUserAchievements = async (userId: string) => {
  const [all, unlocked] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { xpReward: 'desc' } }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    }),
  ])

  const unlockedIds = new Set(unlocked.map((u) => u.achievementId))

  return {
    unlocked: unlocked.map((u) => ({
      ...u.achievement,
      unlockedAt: u.unlockedAt,
    })),
    locked: all.filter((a) => !unlockedIds.has(a.id)),
    total: all.length,
    unlockedCount: unlocked.length,
  }
}

// ── Get leaderboard ───────────────────────────────────────────────
export const getLeaderboard = async (limit = 20) => {
  return prisma.user.findMany({
    orderBy: { totalXP: 'desc' },
    take: limit,
    select: {
      id: true,
      username: true,
      level: true,
      totalXP: true,
      avatarConfig: true,
      tier: true,
    },
  })
}