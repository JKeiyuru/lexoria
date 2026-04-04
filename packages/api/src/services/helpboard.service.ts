import { prisma } from '@lexoria/database'

export const createPost = async (
  userId: string,
  title: string,
  body: string,
  chapterId?: string
) => {
  return prisma.helpPost.create({
    data: { userId, title, body, chapterId },
    include: {
      user: { select: { id: true, username: true, level: true } },
      chapter: { select: { id: true, title: true } },
      _count: { select: { answers: true } },
    },
  })
}

export const getPosts = async (page = 1, limit = 20, chapterId?: string) => {
  const where = chapterId ? { chapterId } : {}
  const skip = (page - 1) * limit

  const [posts, total] = await Promise.all([
    prisma.helpPost.findMany({
      where,
      orderBy: [{ resolvedAt: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
      include: {
        user: { select: { id: true, username: true, level: true } },
        chapter: { select: { id: true, title: true } },
        _count: { select: { answers: true } },
      },
    }),
    prisma.helpPost.count({ where }),
  ])

  return { posts, total, pages: Math.ceil(total / limit), page }
}

export const getPostById = async (postId: string) => {
  const post = await prisma.helpPost.findUnique({
    where: { id: postId },
    include: {
      user: { select: { id: true, username: true, level: true } },
      chapter: { select: { id: true, title: true } },
      answers: {
        orderBy: [{ isAccepted: 'desc' }, { voteCount: 'desc' }],
        include: {
          user: { select: { id: true, username: true, level: true } },
        },
      },
    },
  })
  if (!post) throw new Error('POST_NOT_FOUND')
  return post
}

export const createAnswer = async (
  userId: string,
  postId: string,
  body: string
) => {
  const post = await prisma.helpPost.findUnique({ where: { id: postId } })
  if (!post) throw new Error('POST_NOT_FOUND')

  const answer = await prisma.helpAnswer.create({
    data: { userId, postId, body },
    include: {
      user: { select: { id: true, username: true, level: true } },
    },
  })

  // Award XP for helping
  await prisma.user.update({
    where: { id: userId },
    data: { totalXP: { increment: 15 } },
  })

  return answer
}

export const votePost = async (userId: string, postId: string) => {
  // Check if already voted
  const existing = await prisma.postVote.findUnique({
    where: { userId_postId: { userId, postId } },
  })

  if (existing) throw new Error('ALREADY_VOTED')

  // Record the vote
  await prisma.postVote.create({ data: { userId, postId } })

  // Increment count
  return prisma.helpPost.update({
    where: { id: postId },
    data: { voteCount: { increment: 1 } },
  })
}

export const voteAnswer = async (userId: string, answerId: string) => {
  const answer = await prisma.helpAnswer.findUnique({
    where: { id: answerId },
  })

  if (!answer) throw new Error('ANSWER_NOT_FOUND')

  // Cannot vote on your own answer
  if (answer.userId === userId) throw new Error('CANNOT_VOTE_OWN')

  // Check if already voted
  const existing = await prisma.answerVote.findUnique({
    where: { userId_answerId: { userId, answerId } },
  })

  if (existing) throw new Error('ALREADY_VOTED')

  // Record the vote
  await prisma.answerVote.create({ data: { userId, answerId } })

  // Increment count
  return prisma.helpAnswer.update({
    where: { id: answerId },
    data: { voteCount: { increment: 1 } },
  })
}

export const acceptAnswer = async (
  userId: string,
  answerId: string
) => {
  const answer = await prisma.helpAnswer.findUnique({
    where: { id: answerId },
    include: { post: true },
  })

  if (!answer) throw new Error('ANSWER_NOT_FOUND')
  if (answer.post.userId !== userId) throw new Error('NOT_POST_OWNER')

  // Unaccept any previously accepted answer on this post
  await prisma.helpAnswer.updateMany({
    where: { postId: answer.postId, isAccepted: true },
    data: { isAccepted: false },
  })

  // Accept this answer and mark post resolved
  await prisma.helpAnswer.update({
    where: { id: answerId },
    data: { isAccepted: true },
  })

  await prisma.helpPost.update({
    where: { id: answer.postId },
    data: { resolvedAt: new Date() },
  })

  // Bonus XP for the answer author
  await prisma.user.update({
    where: { id: answer.userId },
    data: { totalXP: { increment: 50 } },
  })

  return { success: true }
}