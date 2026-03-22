import { prisma } from '@lexoria/database'

export const getAllSubjects = async (userTier: string) => {
  const subjects = await prisma.subject.findMany({
    orderBy: { orderIndex: 'asc' },
    include: {
      _count: { select: { seasons: true } },
    },
  })

  return subjects.map((s) => ({
    ...s,
    locked: !s.isFree && userTier === 'FREE',
  }))
}

export const getSubjectBySlug = async (slug: string, userTier: string) => {
  const subject = await prisma.subject.findUnique({
    where: { slug },
    include: {
      seasons: {
        orderBy: { orderIndex: 'asc' },
        include: {
          _count: { select: { chapters: true } },
        },
      },
    },
  })

  if (!subject) throw new Error('SUBJECT_NOT_FOUND')

  return {
    ...subject,
    locked: !subject.isFree && userTier === 'FREE',
    seasons: subject.seasons.map((s) => ({
      ...s,
      locked: !s.isFree && userTier === 'FREE',
    })),
  }
}

export const getSeasonWithChapters = async (
  seasonId: string,
  userTier: string,
  userId: string
) => {
  const season = await prisma.season.findUnique({
    where: { id: seasonId },
    include: {
      subject: { select: { name: true, slug: true, color: true } },
      chapters: {
        orderBy: { orderIndex: 'asc' },
        include: {
          _count: { select: { challenges: true } },
        },
      },
    },
  })

  if (!season) throw new Error('SEASON_NOT_FOUND')
  if (!season.isFree && userTier === 'FREE') throw new Error('LOCKED')

  // Get user progress for all chapters in this season
  const progress = await prisma.userProgress.findMany({
    where: {
      userId,
      chapterId: { in: season.chapters.map((c) => c.id) },
    },
  })

  const completedChapterIds = new Set(progress.map((p) => p.chapterId))

  return {
    ...season,
    chapters: season.chapters.map((c, index) => ({
      ...c,
      locked: !c.isFree && userTier === 'FREE',
      completed: completedChapterIds.has(c.id),
      // First chapter always unlocked, others unlock after previous completed
      accessible:
        index === 0 ||
        completedChapterIds.has(season.chapters[index - 1].id),
    })),
  }
}

export const getChapterById = async (
  chapterId: string,
  userTier: string,
  userId: string
) => {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      season: {
        include: {
          subject: { select: { name: true, slug: true, color: true } },
        },
      },
      challenges: {
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          title: true,
          type: true,
          description: true,
          prompt: true,
          starterCode: true,
          xpReward: true,
          orderIndex: true,
          // Never send solution to client
        },
      },
    },
  })

  if (!chapter) throw new Error('CHAPTER_NOT_FOUND')
  if (!chapter.isFree && userTier === 'FREE') throw new Error('LOCKED')

  // Get user's progress and attempts on this chapter
  const userProgress = await prisma.userProgress.findUnique({
    where: { userId_chapterId: { userId, chapterId } },
  })

  const attempts = await prisma.challengeAttempt.findMany({
    where: {
      userId,
      challengeId: { in: chapter.challenges.map((c) => c.id) },
    },
    orderBy: { attemptedAt: 'desc' },
  })

  const passedChallengeIds = new Set(
    attempts.filter((a) => a.passed).map((a) => a.challengeId)
  )

  return {
    ...chapter,
    completed: !!userProgress,
    completedAt: userProgress?.completedAt || null,
    challenges: chapter.challenges.map((c) => ({
      ...c,
      passed: passedChallengeIds.has(c.id),
    })),
  }
}