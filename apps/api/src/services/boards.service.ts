import { prisma } from '@hello/database'
import type { CreateBoardInput, UpdateBoardInput } from '@hello/validation'
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

export async function findBoardById(boardId: string, userId: string): Promise<Board | null> {
  return prisma.board.findFirst({
    where: {
      id: boardId,
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
  })
}

export async function updateBoard(
  boardId: string,
  userId: string,
  data: UpdateBoardInput
): Promise<Board | null> {
  const result = await prisma.board.updateMany({
    where: {
      id: boardId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId, role: { in: ['OWNER', 'EDITOR'] } } } },
      ],
    },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.bgColor !== undefined && { bgColor: data.bgColor }),
    },
  })

  if (result.count === 0) return null

  return prisma.board.findUnique({
    where: { id: boardId },
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
}

export async function deleteBoard(boardId: string, userId: string): Promise<boolean> {
  const result = await prisma.board.deleteMany({
    where: {
      id: boardId,
      ownerId: userId,
    },
  })

  return result.count > 0
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
