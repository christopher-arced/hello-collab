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
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId, role: { in: ['OWNER', 'EDITOR'] } } } },
      ],
    },
  })

  if (!board) return null

  return prisma.board.update({
    where: { id: boardId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.bgColor !== undefined && { bgColor: data.bgColor }),
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

export async function deleteBoard(boardId: string, userId: string): Promise<boolean> {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId: userId,
    },
  })

  if (!board) return false

  await prisma.board.delete({ where: { id: boardId } })
  return true
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
