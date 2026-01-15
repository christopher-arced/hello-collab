import { prisma } from '@hello/database'
import type { CreateBoardInput } from '@hello/validation'
import type { Board } from '@hello/types'

export async function findBoards(userId: string): Promise<Board[]> {
  return prisma.board.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: {
      id: true,
      title: true,
      description: true,
      bgColor: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function createBoard(data: CreateBoardInput, ownerId: string): Promise<Board> {
  const board = await prisma.board.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      bgColor: data.bgColor ?? '#0079BF',
      ownerId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      bgColor: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return board
}
