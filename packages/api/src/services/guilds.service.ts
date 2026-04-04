import { prisma } from '@lexoria/database'

export const createGuild = async (userId: string, name: string, description?: string) => {
  // Check user isn't already in a guild
  const existing = await prisma.guildMember.findFirst({ where: { userId } })
  if (existing) throw new Error('ALREADY_IN_GUILD')

  // Check name is taken
  const nameTaken = await prisma.guild.findUnique({ where: { name } })
  if (nameTaken) throw new Error('NAME_TAKEN')

  const guild = await prisma.guild.create({
    data: {
      name,
      description,
      members: {
        create: { userId, role: 'LEADER' },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, username: true, level: true, totalXP: true, tier: true },
          },
        },
      },
    },
  })

  return guild
}

export const joinGuild = async (userId: string, guildId: string) => {
  const existing = await prisma.guildMember.findFirst({ where: { userId } })
  if (existing) throw new Error('ALREADY_IN_GUILD')

  const guild = await prisma.guild.findUnique({ where: { id: guildId } })
  if (!guild) throw new Error('GUILD_NOT_FOUND')

  await prisma.guildMember.create({
    data: { userId, guildId, role: 'MEMBER' },
  })

  return prisma.guild.findUnique({
    where: { id: guildId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, username: true, level: true, totalXP: true },
          },
        },
        orderBy: { joinedAt: 'asc' },
      },
    },
  })
}

export const leaveGuild = async (userId: string) => {
  const membership = await prisma.guildMember.findFirst({ where: { userId } })
  if (!membership) throw new Error('NOT_IN_GUILD')

  await prisma.guildMember.delete({ where: { id: membership.id } })

  // If leader left and guild has other members, promote oldest member
  const remaining = await prisma.guildMember.findMany({
    where: { guildId: membership.guildId },
    orderBy: { joinedAt: 'asc' },
  })

  if (remaining.length === 0) {
    // Delete empty guild
    await prisma.guild.delete({ where: { id: membership.guildId } })
  } else if (membership.role === 'LEADER') {
    await prisma.guildMember.update({
      where: { id: remaining[0].id },
      data: { role: 'LEADER' },
    })
  }

  return { success: true }
}

export const getAllGuilds = async () => {
  return prisma.guild.findMany({
    orderBy: { totalXP: 'desc' },
    take: 50,
    include: {
      _count: { select: { members: true } },
    },
  })
}

export const getGuildById = async (guildId: string) => {
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true, username: true,
              level: true, totalXP: true, tier: true,
            },
          },
        },
        orderBy: { joinedAt: 'asc' },
      },
    },
  })
  if (!guild) throw new Error('GUILD_NOT_FOUND')
  return guild
}

export const getUserGuild = async (userId: string) => {
  const membership = await prisma.guildMember.findFirst({
    where: { userId },
    include: {
      guild: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true, username: true,
                  level: true, totalXP: true, tier: true,
                },
              },
            },
            orderBy: { joinedAt: 'asc' },
          },
        },
      },
    },
  })
  return membership ?? null
}